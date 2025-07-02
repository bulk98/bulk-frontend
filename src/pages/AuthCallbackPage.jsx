import React, { useEffect, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, CircularProgress, Typography, Container } from '@mui/material';

const AuthCallbackPage = () => {
    const { login } = useAuth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');
        const userDataString = searchParams.get('user');

        if (token && userDataString) {
            try {
                // El backend nos devuelve el usuario como un string JSON, lo parseamos
                const user = JSON.parse(decodeURIComponent(userDataString));

                // Usamos la función de login del contexto, pero solo para guardar el token
                // y luego actualizamos el usuario con los datos frescos de Google.
                localStorage.setItem('authToken', token);
                localStorage.setItem('authUser', JSON.stringify(user));
                
                // Forzamos un reload para que el AuthContext se re-inicialice con los nuevos datos
                window.location.href = '/'; // Redirige a la página de inicio

            } catch (error) {
                console.error("Error procesando los datos de autenticación:", error);
                navigate('/login', { state: { message: 'Hubo un error durante el inicio de sesión.' } });
            }
        } else {
            // Si no hay token, redirigir a login con un mensaje de error
            navigate('/login', { state: { message: 'La autenticación con Google falló.' } });
        }
    }, [searchParams, login, navigate]);

    return (
        <Container component="main" maxWidth="xs" sx={{ mt: 8, textAlign: 'center' }}>
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>Autenticando, por favor espera...</Typography>
        </Container>
    );
};

export default AuthCallbackPage;