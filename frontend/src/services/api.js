import axios from 'axios';

const RAW_API_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api').trim().replace(/\/+$/, '');
const API_BASE_URL = RAW_API_URL.endsWith('/api') ? RAW_API_URL : `${RAW_API_URL}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Extract error message & handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired or unauthorized
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

// API Service functions
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const userApi = {
  discover: (params) => api.get('/users/discover', { params }),
  getProfile: (id) => api.get(`/users/${id}`),
  updateProfile: (data) => api.put('/users/profile', data),
};

export const skillRequestApi = {
  create: (data) => api.post('/skill-requests', data),
  getReceived: () => api.get('/skill-requests/received'),
  getSent: () => api.get('/skill-requests/sent'),
  accept: (id) => api.patch(`/skill-requests/${id}/accept`),
  reject: (id) => api.patch(`/skill-requests/${id}/reject`),
};

export const messageApi = {
  send: (data) => api.post('/messages', data),
  getConversation: (userId) => api.get(`/messages/${userId}`),
  getConversations: () => api.get('/messages/conversations'),
  getUnreadCount: () => api.get('/messages/unread-count'),
  markAsRead: (partnerId) => api.patch(`/messages/${partnerId}/read`),
};

export const availabilityApi = {
  create: (data) => api.post('/availability', data),
  getAvailable: () => api.get('/availability'),
  getMySlots: () => api.get('/availability/my'),
  getUserSlots: (userId) => api.get(`/availability/user/${userId}`),
  deleteSlot: (id) => api.delete(`/availability/${id}`),
};

export const sessionApi = {
  book: (data) => api.post('/sessions', data),
  getMySessions: () => api.get('/sessions/my'),
  accept: (id) => api.patch(`/sessions/${id}/accept`),
  reject: (id) => api.patch(`/sessions/${id}/reject`),
  cancel: (id) => api.patch(`/sessions/${id}/cancel`),
  complete: (id) => api.patch(`/sessions/${id}/complete`),
  submitFeedback: (data) => api.post('/sessions/feedback', data),
};

export const skillDnaApi = {
  getMyDna: () => api.get('/skill-dna/my'),
  getUserDna: (userId) => api.get(`/skill-dna/${userId}`),
};

export const skillPassportApi = {
  getMyPassport: () => api.get('/skill-passport/my'),
  getUserPassport: (userId) => api.get(`/skill-passport/${userId}`),
};

export const pointsApi = {
  getMyPoints: () => api.get('/points/my'),
  claimDaily: () => api.post('/points/claim-daily'),
};

export const adminApi = {
  getStats: () => api.get('/admin/stats'),
};

export default api;
