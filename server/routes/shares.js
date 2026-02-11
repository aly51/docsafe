const express = require('express');
const { nanoid } = require('nanoid');
const QRCode = require('qrcode');
const Share = require('../models/Share');
const Document = require('../models/Document');
const auth = require('../middleware/auth');

const router = express.Router();

// Create a share
router.post('/', auth, async (req, res) => {
  try {
    const { documentIds, password, expiresIn } = req.body;

    // Verify all documents belong to user
    const documents = await Document.find({
      _id: { $in: documentIds },
      userId: req.userId
    });

    if (documents.length !== documentIds.length) {
      return res.status(400).json({ error: 'Some documents not found' });
    }

    // Generate unique share ID
    const shareId = nanoid(10);

    // Calculate expiration date if provided
    let expiresAt = null;
    if (expiresIn) {
      expiresAt = new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000); // days to milliseconds
    }

    const share = new Share({
      userId: req.userId,
      documentIds,
      shareId,
      password: password || null,
      expiresAt
    });

    await share.save();

    // Generate QR code
    const shareUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/share/${shareId}`;
    const qrCode = await QRCode.toDataURL(shareUrl);

    res.status(201).json({
      shareId,
      shareUrl,
      qrCode,
      documentCount: documentIds.length,
      hasPassword: !!password,
      expiresAt
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creating share' });
  }
});

// Get user's shares
router.get('/', auth, async (req, res) => {
  try {
    const shares = await Share.find({ userId: req.userId })
      .populate('documentIds', 'originalName size mimetype')
      .sort({ createdAt: -1 });

    const sharesWithUrls = shares.map(share => ({
      ...share.toObject(),
      shareUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/share/${share.shareId}`,
      hasPassword: !!share.password
    }));

    res.json(sharesWithUrls);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching shares' });
  }
});

// Delete a share
router.delete('/:shareId', auth, async (req, res) => {
  try {
    const share = await Share.findOne({ shareId: req.params.shareId, userId: req.userId });
    
    if (!share) {
      return res.status(404).json({ error: 'Share not found' });
    }

    await Share.deleteOne({ shareId: req.params.shareId });
    res.json({ message: 'Share deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting share' });
  }
});

// Access a share (public route)
router.post('/access/:shareId', async (req, res) => {
  try {
    const { password } = req.body;
    const share = await Share.findOne({ shareId: req.params.shareId })
      .populate('documentIds');

    if (!share) {
      return res.status(404).json({ error: 'Share not found' });
    }

    // Check if expired
    if (share.expiresAt && share.expiresAt < new Date()) {
      return res.status(410).json({ error: 'Share has expired' });
    }

    // Check password if required
    if (share.password) {
      if (!password) {
        return res.status(401).json({ error: 'Password required', requiresPassword: true });
      }

      const isMatch = await share.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid password' });
      }
    }

    // Increment access count
    share.accessCount += 1;
    await share.save();

    res.json({
      documents: share.documentIds.map(doc => ({
        id: doc._id,
        originalName: doc.originalName,
        size: doc.size,
        mimetype: doc.mimetype,
        uploadedAt: doc.uploadedAt
      })),
      expiresAt: share.expiresAt
    });
  } catch (error) {
    res.status(500).json({ error: 'Error accessing share' });
  }
});

// Download document from share (public route)
router.get('/download/:shareId/:documentId', async (req, res) => {
  try {
    const share = await Share.findOne({ shareId: req.params.shareId });

    if (!share) {
      return res.status(404).json({ error: 'Share not found' });
    }

    // Check if expired
    if (share.expiresAt && share.expiresAt < new Date()) {
      return res.status(410).json({ error: 'Share has expired' });
    }

    // Check if document is in this share
    const documentId = req.params.documentId;
    if (!share.documentIds.includes(documentId)) {
      return res.status(403).json({ error: 'Document not in this share' });
    }

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.download(document.path, document.originalName);
  } catch (error) {
    res.status(500).json({ error: 'Error downloading document' });
  }
});

module.exports = router;
