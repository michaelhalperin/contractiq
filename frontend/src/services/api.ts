import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// Determine API URL based on environment
const getApiUrl = (): string => {
  // VITE_API_URL should be set in .env.development or .env.production
  // Fallback to defaults if not set
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Fallback: Check if we're in production mode
  const isProduction = import.meta.env.PROD;

  // Production backend URL (fallback)
  if (isProduction) {
    return 'https://contractiq.onrender.com/api';
  }

  // Development backend URL (fallback)
  // Backend runs on port 5001 by default
  return 'http://localhost:5001/api';
};

const API_URL = getApiUrl();

// Log API URL in development for debugging
if (import.meta.env.DEV) {
  console.log('🔧 API URL:', API_URL);
  console.log('🔧 Environment:', import.meta.env.MODE);
  console.log('🔧 Hostname:', window.location.hostname);
}

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't redirect if we're already on login/register endpoints
      // This allows login/register errors to be displayed properly
      const url = error.config?.url || '';
      const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register');
      
      if (!isAuthEndpoint) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

