// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'https://mmg4jzkh-3000.use2.devtunnels.ms/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Este interceptor añade el token de autenticación a todas las peticiones salientes.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;