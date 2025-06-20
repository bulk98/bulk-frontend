// src/App.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppRouter from './router/AppRouter';
import { useAuth } from './contexts/AuthContext';
import api from './services/api';
import './App.css';

function App() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error.response?.status;
        const wasHandled = error.config?.handledByComponent;

        if ((status === 401 || status === 403) && !wasHandled) {
          console.warn("Sesión expirada o inválida. Cerrando sesión...");
          logout();
          navigate('/login', { state: { message: 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.' } });
        }

        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [logout, navigate]);

  return <AppRouter />;
}

export default App;
