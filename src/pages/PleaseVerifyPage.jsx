import React from 'react';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import { Container, Paper, Typography, Box, Button } from '@mui/material';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';

const PleaseVerifyPage = () => {
    const location = useLocation();
    // Se puede pasar el email desde la página de registro si se desea
    const email = location.state?.email;

    return (
        <Container component="main" maxWidth="sm" sx={{ mt: 8 }}>
            <Paper sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <MarkEmailReadIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography component="h1" variant="h4" gutterBottom>
                    ¡Casi listo! Revisa tu correo
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Hemos enviado un enlace de verificación a 
                    <Box component="span" fontWeight="bold" sx={{ mx: 1 }}>{email || 'la dirección de correo que proporcionaste'}</Box>.
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                    Por favor, haz clic en ese enlace para activar tu cuenta y poder iniciar sesión.
                </Typography>
                <Button component={RouterLink} to="/login" variant="contained" sx={{ mt: 4 }}>
                    Ir a Inicio de Sesión
                </Button>
            </Paper>
        </Container>
    );
};

export default PleaseVerifyPage;