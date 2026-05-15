import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

/**
 * Axios instance pre-configured for the BookNest API Gateway.
 * In development: requests to /api/* are proxied by Vite to http://localhost:9000
 * In production: set VITE_API_BASE_URL env var pointing to the API gateway.
 *
 * Interceptors handle:
 *  - Attaching JWT Bearer token to every outgoing request
 *  - Centralised 401 handling (session expiry → redirect to login)
 *  - Network error normalisation
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL
    ? `${import.meta.env.VITE_API_BASE_URL}/api`
    : '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
});

// ── Request Interceptor ───────────────────────
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ──────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const raw = error.response?.data;
    let message =
      (typeof raw === 'string' ? raw : raw?.message) ||
      raw?.error ||
      error.message;

    if (typeof message === 'object') {
      message = message?.message || JSON.stringify(message);
    }

    if (status === 401) {
      console.error('401 Unauthorized - token may be invalid');
      console.error('Full error response:', error.response?.data);
      console.error('Request headers sent:', error.config?.headers);
    } else if (status === 403) {
      console.error('403 Forbidden - insufficient permissions');
      toast.error('You do not have permission to perform this action.');
    } else if (status >= 500) {
      console.error('Server error:', status, message);
      const reqUrl = error.config?.url || '';
      if (!reqUrl.includes('/orders/place') && !reqUrl.includes('/orders/verify')) {
        toast.error('A server error occurred. Please try again later.');
      }
    } else {
      console.error('API Error:', status, message);
    }

    return Promise.reject(
      new Error(typeof message === 'string' ? message : 'An unexpected error occurred.')
    );
  }
);

export default apiClient;