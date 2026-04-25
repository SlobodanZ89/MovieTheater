import axios from 'axios';
import { getStoredAuth } from '../auth/AuthContext';
import { API_BASE_URL } from '../config';

export const http = axios.create({
  baseURL: API_BASE_URL,
});

http.interceptors.request.use((config) => {
  const { token } = getStoredAuth();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function extractBackendMessage(error) {
  const data = error?.response?.data;
  return (
    data?.detail ||
    data?.message ||
    data?.title ||
    (typeof data === 'string' ? data : null) ||
    error?.message ||
    'Request failed'
  );
}

http.interceptors.response.use(
  (res) => res,
  (error) => {
    error.backendMessage = extractBackendMessage(error);
    return Promise.reject(error);
  }
);

