import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
};

// Documents API
export const documentsAPI = {
  upload: (formData) => api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getAll: () => api.get('/documents'),
  delete: (id) => api.delete(`/documents/${id}`),
  download: (id) => api.get(`/documents/download/${id}`, { responseType: 'blob' }),
};

// Shares API
export const sharesAPI = {
  create: (data) => api.post('/shares', data),
  getAll: () => api.get('/shares'),
  delete: (shareId) => api.delete(`/shares/${shareId}`),
  access: (shareId, password) => api.post(`/shares/access/${shareId}`, { password }),
  downloadFromShare: (shareId, documentId) => 
    axios.get(`${API_URL}/shares/download/${shareId}/${documentId}`, { 
      responseType: 'blob' 
    }),
};

export default api;
