// src/router/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation, Link as RouterLink } from 'react-router-dom'; // <--- ASEGÚRATE QUE ESTA LÍNEA ESTÉ ASÍ
import { useAuth } from '../contexts/AuthContext';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button'; 
import Paper from '@mui/material/Paper'; // Import Paper si no lo tenías de mi última sugerencia

const ProtectedRoute = ({ children, allowedUserTypes }) => {
    const { user, isAuthenticated, loadingAuth } = useAuth();
    const location = useLocation();

    if (loadingAuth) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedUserTypes && allowedUserTypes.length > 0) {
        if (!user || !user.tipo_usuario || !allowedUserTypes.includes(user.tipo_usuario)) {
            console.warn(`Acceso denegado a la ruta ${location.pathname}. Usuario tipo: ${user?.tipo_usuario}. Tipos permitidos: ${allowedUserTypes.join(', ')}`);
            return (
                <Container maxWidth="sm" sx={{ textAlign: 'center', mt: 5, p: 3 }}>
                    <Paper elevation={3} sx={{ p: 3 }}> {/* Envuelto en Paper para mejor UI */}
                        <Typography variant="h5" color="error" gutterBottom>
                            🚫 Acceso Denegado
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 3 }}>
                            Para poder crear tu propia comunidad necesitas tener una cuenta OG, que esperas para crearla!.
                        </Typography>
                        <Button 
                            component={RouterLink} // Aquí se usa RouterLink
                            to="/" 
                            variant="contained"
                        >
                            Ir a Inicio
                        </Button>
                    </Paper>
                </Container>
            );
        }
    }

    return children;
};

export default ProtectedRoute;