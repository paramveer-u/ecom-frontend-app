import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong. Please try again.';
    return Promise.reject({
      status: error.response?.status,
      message,
      errors: error.response?.data?.errors || null,
    });
  }
);

export const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

export default api;
