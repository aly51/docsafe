import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { documentsAPI, sharesAPI } from '../services/api';
import { FiUpload, FiDownload, FiTrash2, FiShare2, FiLogOut, FiFile } from 'react-icons/fi';
import ShareModal from './ShareModal';
import './Dashboard.css';

function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [activeTab, setActiveTab] = useState('documents');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDocuments();
    fetchShares();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await documentsAPI.getAll();
      setDocuments(response.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchShares = async () => {
    try {
      const response = await sharesAPI.getAll();
      setShares(response.data);
    } catch (error) {
      console.error('Error fetching shares:', error);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('document', file);

    setUploading(true);
    try {
      await documentsAPI.upload(formData);
      await fetchDocuments();
      e.target.value = '';
    } catch (error) {
      alert('Error uploading file: ' + (error.response?.data?.error || 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      await documentsAPI.delete(id);
      await fetchDocuments();
      setSelectedDocs(selectedDocs.filter(docId => docId !== id));
    } catch (error) {
      alert('Error deleting document');
    }
  };

  const handleDownload = async (id, originalName) => {
    try {
      const response = await documentsAPI.download(id);
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

  const toggleDocSelection = (id) => {
    setSelectedDocs(prev => 
      prev.includes(id) ? prev.filter(docId => docId !== id) : [...prev, id]
    );
  };

  const handleShareCreated = () => {
    fetchShares();
    setSelectedDocs([]);
  };

  const handleDeleteShare = async (shareId) => {
    if (!window.confirm('Are you sure you want to delete this share?')) return;

    try {
      await sharesAPI.delete(shareId);
      await fetchShares();
    } catch (error) {
      alert('Error deleting share');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>DocSafe</h1>
          <p>Welcome, {user?.name}</p>
        </div>
        <button onClick={handleLogout} className="btn-logout">
          <FiLogOut /> Logout
        </button>
      </div>

      <div className="tabs">
        <button 
          className={activeTab === 'documents' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('documents')}
        >
          My Documents
        </button>
        <button 
          className={activeTab === 'shares' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('shares')}
        >
          Shared Links
        </button>
      </div>

      {activeTab === 'documents' && (
        <>
          <div className="actions-bar">
            <label className="btn-upload">
              <FiUpload /> {uploading ? 'Uploading...' : 'Upload Document'}
              <input 
                type="file" 
                onChange={handleFileUpload} 
                disabled={uploading}
                style={{ display: 'none' }}
              />
            </label>

            {selectedDocs.length > 0 && (
              <button 
                onClick={() => setShowShareModal(true)}
                className="btn-share"
              >
                <FiShare2 /> Share Selected ({selectedDocs.length})
              </button>
            )}
          </div>

          {loading ? (
            <div className="loading">Loading documents...</div>
          ) : documents.length === 0 ? (
            <div className="empty-state">
              <FiFile size={64} />
              <p>No documents yet</p>
              <p className="empty-subtitle">Upload your first document to get started</p>
            </div>
          ) : (
            <div className="documents-grid">
              {documents.map(doc => (
                <div 
                  key={doc._id} 
                  className={`document-card ${selectedDocs.includes(doc._id) ? 'selected' : ''}`}
                >
                  <div className="document-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedDocs.includes(doc._id)}
                      onChange={() => toggleDocSelection(doc._id)}
                    />
                  </div>
                  
                  <div className="document-info">
                    <h3>{doc.originalName}</h3>
                    <p className="document-meta">
                      {formatFileSize(doc.size)} • {formatDate(doc.uploadedAt)}
                    </p>
                  </div>
                  
                  <div className="document-actions">
                    <button 
                      onClick={() => handleDownload(doc._id, doc.originalName)}
                      className="btn-icon"
                      title="Download"
                    >
                      <FiDownload />
                    </button>
                    <button 
                      onClick={() => handleDelete(doc._id)}
                      className="btn-icon btn-danger"
                      title="Delete"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'shares' && (
        <div className="shares-list">
          {shares.length === 0 ? (
            <div className="empty-state">
              <FiShare2 size={64} />
              <p>No shared links yet</p>
              <p className="empty-subtitle">Select documents and create a share link</p>
            </div>
          ) : (
            shares.map(share => (
              <div key={share.shareId} className="share-card">
                <div className="share-info">
                  <h3>{share.documentIds.length} document(s)</h3>
                  <p className="share-url">{share.shareUrl}</p>
                  <div className="share-meta">
                    <span>Created: {formatDate(share.createdAt)}</span>
                    {share.hasPassword && <span className="badge">Password Protected</span>}
                    {share.expiresAt && <span>Expires: {formatDate(share.expiresAt)}</span>}
                    <span>Views: {share.accessCount}</span>
                  </div>
                </div>
                <div className="share-actions">
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(share.shareUrl);
                      alert('Link copied to clipboard!');
                    }}
                    className="btn-secondary"
                  >
                    Copy Link
                  </button>
                  <button 
                    onClick={() => handleDeleteShare(share.shareId)}
                    className="btn-danger"
                  >
                    <FiTrash2 /> Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showShareModal && (
        <ShareModal
          documentIds={selectedDocs}
          onClose={() => setShowShareModal(false)}
          onShareCreated={handleShareCreated}
        />
      )}
    </div>
  );
}

export default Dashboard;
