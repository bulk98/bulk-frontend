import React, { useState, useEffect } from 'react';
// MODIFICADO: Se importa useSearchParams para leer los parámetros de la URL
import { useParams, Link as RouterLink, useSearchParams } from 'react-router-dom';
// Se elimina la importación de verifyEmailToken porque ya no se llama desde aquí
import { Container, Paper, Typography, Box, Button, CircularProgress, Alert } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

const EmailVerifiedPage = () => {
    // MODIFICADO: Se usa useSearchParams para determinar el estado de la página
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('loading'); // Puede ser: 'loading', 'success', o 'error'

    useEffect(() => {
        const errorParam = searchParams.get('error');
        const successParam = searchParams.get('success');

        // El backend nos dice si la operación fue exitosa o no a través de estos parámetros
        if (errorParam) {
            setStatus('error');
        } else if (successParam) {
            setStatus('success');
        } else {
            // Si no hay parámetros, podríamos estar esperando o ser un acceso inválido
            // Por ahora, lo marcaremos como error por seguridad.
            // En un futuro se podría añadir una llamada a la API aquí como fallback.
            setStatus('error'); 
        }
    }, [searchParams]);

    // La vista de "cargando" se puede eliminar o mantener si la redirección es lenta
    if (status === 'loading') {
        return (
            <Container component="main" maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>Procesando verificación...</Typography>
            </Container>
        );
    }

    return (
        <Container component="main" maxWidth="sm" sx={{ mt: 8 }}>
            <Paper sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                {status === 'error' ? (
                    <>
                        <ErrorIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
                        <Typography component="h1" variant="h4" gutterBottom>Error de Verificación</Typography>
                        <Alert severity="error" sx={{ width: '100%', textAlign: 'left' }}>
                            El enlace de verificación que has usado es inválido o ha expirado. Por favor, intenta registrarte de nuevo o contacta a soporte.
                        </Alert>
                    </>
                ) : (
                    <>
                        <CheckCircleIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                        <Typography component="h1" variant="h4" gutterBottom>¡Correo Verificado!</Typography>
                        <Typography variant="body1" color="text.secondary">
                            Tu cuenta ha sido activada con éxito. Ya puedes iniciar sesión.
                        </Typography>
                    </>
                )}
                <Button component={RouterLink} to="/login" variant="contained" sx={{ mt: 4 }}>
                    Ir a Inicio de Sesión
                </Button>
            </Paper>
        </Container>
    );
};

export default EmailVerifiedPage;