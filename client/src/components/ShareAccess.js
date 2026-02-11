import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { sharesAPI } from '../services/api';
import { FiDownload, FiLock, FiFile } from 'react-icons/fi';
import './ShareAccess.css';

function ShareAccess() {
  const { shareId } = useParams();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    attemptAccess();
  }, [shareId]);

  const attemptAccess = async (pwd = '') => {
    setLoading(true);
    setError('');

    try {
      const response = await sharesAPI.access(shareId, pwd);
      setDocuments(response.data.documents);
      setAuthenticated(true);
    } catch (err) {
      if (err.response?.data?.requiresPassword) {
        setRequiresPassword(true);
      } else {
        setError(err.response?.data?.error || 'Unable to access share');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    attemptAccess(password);
  };

  const handleDownload = async (documentId, originalName) => {
    try {
      const response = await sharesAPI.downloadFromShare(shareId, documentId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', originalName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Error downloading document');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="share-access">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="share-access">
        <div className="error-container">
          <h2>Unable to Access Share</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (requiresPassword && !authenticated) {
    return (
      <div className="share-access">
        <div className="password-container">
          <div className="lock-icon">
            <FiLock size={48} />
          </div>
          <h2>Password Protected</h2>
          <p>This share requires a password to access</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handlePasswordSubmit} className="password-form">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="password-input"
              autoFocus
              required
            />
            <button type="submit" className="btn-primary">
              Access Documents
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="share-access">
      <div className="share-header">
        <h1>DocSafe</h1>
        <p>Shared Documents</p>
      </div>

      {documents.length === 0 ? (
        <div className="empty-state">
          <FiFile size={64} />
          <p>No documents in this share</p>
        </div>
      ) : (
        <div className="documents-list">
          <h2>{documents.length} Document{documents.length !== 1 ? 's' : ''} Shared</h2>
          {documents.map(doc => (
            <div key={doc.id} className="document-item">
              <div className="document-icon">
                <FiFile size={24} />
              </div>
              <div className="document-details">
                <h3>{doc.originalName}</h3>
                <p>{formatFileSize(doc.size)}</p>
              </div>
              <button 
                onClick={() => handleDownload(doc.id, doc.originalName)}
                className="btn-download"
              >
                <FiDownload /> Download
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="share-footer">
        <p>Powered by DocSafe - Secure document sharing</p>
      </div>
    </div>
  );
}

export default ShareAccess;
