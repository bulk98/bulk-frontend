import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { requestPasswordReset } from '../services/authService';
import { Container, Paper, Typography, TextField, Button, Box, Alert, CircularProgress } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const ForgotPasswordPage = () => {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const onSubmit = async (data) => {
        setError('');
        setMessage('');
        try {
            const response = await requestPasswordReset(data.email);
            setMessage(response.message);
        } catch (err) {
            setError(err.error || 'Ocurrió un error al procesar la solicitud.');
        }
    };

    return (
        <Container component="main" maxWidth="xs" sx={{ mt: 8 }}>
            <Paper sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="h1" variant="h5">
                    Restablecer Contraseña
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 2, mt: 1, textAlign: 'center' }}>
                    Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
                </Typography>
                
                {message && <Alert severity="success" sx={{ width: '100%', mb: 2 }}>{message}</Alert>}
                {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}

                {!message && (
                    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%' }}>
                        <TextField
                            margin="normal" fullWidth required autoFocus
                            label="Correo Electrónico" type="email"
                            {...register("email", { required: "El correo es obligatorio", pattern: { value: /^\S+@\S+\.\S+$/, message: "Formato de correo inválido" }})}
                            error={!!errors.email} helperText={errors.email?.message}
                        />
                        <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={isSubmitting}>
                            {isSubmitting ? <CircularProgress size={24} /> : 'Enviar Enlace'}
                        </Button>
                    </Box>
                )}
                 <Button component={RouterLink} to="/login" sx={{ mt: 1 }}>
                    Volver a Inicio de Sesión
                </Button>
            </Paper>
        </Container>
    );
};

export default ForgotPasswordPage;