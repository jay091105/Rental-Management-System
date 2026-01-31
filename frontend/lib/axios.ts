import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        // Clear auth and redirect to login. If token expired, add query flag for UI notice
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        const params = new URLSearchParams();
        if (error.response.data && error.response.data.code === 'TOKEN_EXPIRED') {
          params.set('expired', '1');
        }

        // Broadcast logout to other tabs
        try {
          localStorage.setItem('logout', Date.now().toString());
        } catch (e) {
          // ignore
        }

        const query = params.toString();
        const loginUrl = '/login' + (query ? `?${query}` : '');
        window.location.href = loginUrl;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
