import React, { useState } from 'react';
import { sharesAPI } from '../services/api';
import { FiX, FiCopy, FiCheck } from 'react-icons/fi';
import './ShareModal.css';

function ShareModal({ documentIds, onClose, onShareCreated }) {
  const [password, setPassword] = useState('');
  const [expiresIn, setExpiresIn] = useState('');
  const [loading, setLoading] = useState(false);
  const [shareData, setShareData] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleCreateShare = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await sharesAPI.create({
        documentIds,
        password: password || undefined,
        expiresIn: expiresIn ? parseInt(expiresIn) : undefined
      });

      setShareData(response.data);
      onShareCreated();
    } catch (error) {
      alert('Error creating share: ' + (error.response?.data?.error || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (shareData) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Share Created Successfully!</h2>
            <button onClick={onClose} className="btn-close">
              <FiX />
            </button>
          </div>

          <div className="share-result">
            <div className="qr-code-container">
              <img src={shareData.qrCode} alt="QR Code" />
              <p className="qr-label">Scan to access</p>
            </div>

            <div className="share-details">
              <div className="share-url-box">
                <input 
                  type="text" 
                  value={shareData.shareUrl} 
                  readOnly 
                  className="share-url-input"
                />
                <button 
                  onClick={() => copyToClipboard(shareData.shareUrl)}
                  className="btn-copy"
                >
                  {copied ? <FiCheck /> : <FiCopy />}
                </button>
              </div>

              <div className="share-info-grid">
                <div className="info-item">
                  <span className="label">Documents:</span>
                  <span className="value">{shareData.documentCount}</span>
                </div>
                {shareData.hasPassword && (
                  <div className="info-item">
                    <span className="label">Password:</span>
                    <span className="value badge-success">Protected</span>
                  </div>
                )}
                {shareData.expiresAt && (
                  <div className="info-item">
                    <span className="label">Expires:</span>
                    <span className="value">
                      {new Date(shareData.expiresAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <button onClick={onClose} className="btn-primary btn-full">
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Share Link</h2>
          <button onClick={onClose} className="btn-close">
            <FiX />
          </button>
        </div>

        <form onSubmit={handleCreateShare} className="share-form">
          <p className="share-description">
            Creating a share link for {documentIds.length} document(s)
          </p>

          <div className="form-group">
            <label htmlFor="password">Password (optional)</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave empty for no password"
            />
            <small>Add a password to protect your shared documents</small>
          </div>

          <div className="form-group">
            <label htmlFor="expiresIn">Expires in (optional)</label>
            <select
              id="expiresIn"
              value={expiresIn}
              onChange={(e) => setExpiresIn(e.target.value)}
            >
              <option value="">Never expires</option>
              <option value="1">1 day</option>
              <option value="7">7 days</option>
              <option value="30">30 days</option>
              <option value="90">90 days</option>
            </select>
            <small>Choose when this share link should stop working</small>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Share Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ShareModal;
