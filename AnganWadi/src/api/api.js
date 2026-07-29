import axios from 'axios';

// Always use /api — routed through Vite proxy to http://localhost:5000
// This avoids CORS issues and works regardless of .env configuration
const API_URL = '/api';

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

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
};

export const childrenAPI = {
  getAll: () => api.get('/children'),
  create: (childData) => api.post('/children', childData),
  getMyChild: () => api.get('/children/my-child'),
  getChildByParentUsername: (username) => api.get(`/children/parent/${username}`),
  update: (id, childData) => api.put(`/children/${id}`, childData),
  delete: (id) => api.delete(`/children/${id}`),
};

export const attendanceAPI = {
  getAll: () => api.get('/attendance'),
  getByDate: (date) => api.get(`/attendance/date/${date}`),
  mark: (childId, status, date, nextVisitDate) => api.put(`/attendance/${childId}`, { status, date, nextVisitDate }),
};

export default api;

