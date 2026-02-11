const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const Document = require('../models/Document');
const auth = require('../middleware/auth');

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Upload document
router.post('/upload', auth, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const document = new Document({
      userId: req.userId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    });

    await document.save();

    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ error: 'Error uploading document' });
  }
});

// Get all user documents
router.get('/', auth, async (req, res) => {
  try {
    const documents = await Document.find({ userId: req.userId }).sort({ uploadedAt: -1 });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

// Delete document
router.delete('/:id', auth, async (req, res) => {
  try {
    const document = await Document.findOne({ _id: req.params.id, userId: req.userId });
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Delete file from filesystem
    try {
      await fs.unlink(document.path);
    } catch (err) {
      console.error('Error deleting file:', err);
    }

    await Document.deleteOne({ _id: req.params.id });
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting document' });
  }
});

// Download document
router.get('/download/:id', auth, async (req, res) => {
  try {
    const document = await Document.findOne({ _id: req.params.id, userId: req.userId });
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.download(document.path, document.originalName);
  } catch (error) {
    res.status(500).json({ error: 'Error downloading document' });
  }
});

module.exports = router;
