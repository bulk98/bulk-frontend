// src/App.jsx
import React, { useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import AppRouter from './router/AppRouter';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppThemeProvider, useThemeContext } from './contexts/ThemeContext';
import { createBulkTheme } from './theme';
import api from './services/api';
import './App.css';


// Este nuevo componente interno contiene la lógica que ya tenías (el interceptor de Axios)
// y necesita acceso al contexto de autenticación.
const AppContent = () => {
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


// Este componente se encarga de crear y aplicar el tema dinámico (claro u oscuro)
function ThemeWrapper({ children }) {
    const { mode } = useThemeContext();
    
    // Se crea el tema correspondiente al modo actual y se memoriza para evitar recálculos innecesarios.
    const theme = useMemo(() => createBulkTheme(mode), [mode]);

    return (
        <MuiThemeProvider theme={theme}>
            <CssBaseline />
            {children}
        </MuiThemeProvider>
    );
}

// El componente principal App ahora solo se encarga de anidar los proveedores de contexto
function App() {
    return (
        <AuthProvider>
            <AppThemeProvider>
                <ThemeWrapper>
                    <AppContent />
                </ThemeWrapper>
            </AppThemeProvider>
        </AuthProvider>
    );
}

export default App;