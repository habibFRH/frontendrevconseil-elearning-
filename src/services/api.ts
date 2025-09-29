import axios from 'axios';
import authService from './authService';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = authService.getValidToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // No valid token → ensure no stale Authorization header; redirect only for protected paths
      if (config.headers) {
        const headers = config.headers as Record<string, unknown>;
        if ('Authorization' in headers) {
          delete (headers as Record<string, unknown>)['Authorization'];
        }
      }
      const path = window.location.pathname;
      const isProtected = /^\/(dashboard|student|teacher|admin)/.test(path);
      if (isProtected && !path.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return config;
  },
  (error: unknown) => Promise.reject(error instanceof Error ? error : new Error('Request interceptor error'))
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      const path = window.location.pathname;
      const isProtected = /^\/(dashboard|student|teacher|admin)/.test(path);
      if (isProtected && !path.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return;
  }
);

// User profile methods
export const getUserProfile = async () => {
  const response = await api.get('/user/profile');
  return response.data;
};

export default api;
