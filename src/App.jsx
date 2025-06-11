// src/App.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate
import AppRouter from './router/AppRouter';
import { useAuth } from './contexts/AuthContext';
import api from './services/api'; // Importar nuestra instancia centralizada de Axios
import './App.css';

function App() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Aquí configuramos el interceptor de RESPUESTAS
    const responseInterceptor = api.interceptors.response.use(
      // Si la respuesta es exitosa (ej. status 2xx), simplemente la devolvemos
      (response) => response,
      
      // Si la respuesta es un error...
      (error) => {
        // Verificamos si el error es porque el token expiró (status 401 o 403)
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          console.log("Sesión expirada o inválida. Cerrando sesión...");
          logout(); // Limpiamos el contexto y localStorage
          // Redirigimos al login, pasando un mensaje para mostrar al usuario
          navigate('/login', { state: { message: 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.' } });
        }
        // Para cualquier otro error, simplemente lo propagamos
        return Promise.reject(error);
      }
    );

    // Función de limpieza para remover el interceptor cuando el componente se desmonte
    return () => {
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [logout, navigate]); // Se ejecuta solo una vez o si cambian logout/navigate

  return <AppRouter />;
}

export default App;