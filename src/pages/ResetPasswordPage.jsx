import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { resetPassword } from '../services/authService';
import { Container, Paper, Typography, TextField, Button, Box, Alert, CircularProgress } from '@mui/material';

const ResetPasswordPage = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const onSubmit = async (data) => {
        setError('');
        try {
            const response = await resetPassword(token, data.password);
            setSuccess(response.message + " Serás redirigido en 3 segundos...");
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.error || 'Ocurrió un error.');
        }
    };

    return (
        <Container component="main" maxWidth="xs" sx={{ mt: 8 }}>
            <Paper sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="h1" variant="h5">
                    Establecer Nueva Contraseña
                </Typography>
                {success ? (
                    <Alert severity="success" sx={{ mt: 2, width: '100%' }}>{success}</Alert>
                ) : (
                    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2, width: '100%' }}>
                        <TextField
                            margin="normal" fullWidth required type="password"
                            label="Nueva Contraseña"
                            {...register("password", { required: "La contraseña es obligatoria", minLength: { value: 6, message: "Mínimo 6 caracteres" } })}
                            error={!!errors.password} helperText={errors.password?.message}
                        />
                        <TextField
                            margin="normal" fullWidth required type="password"
                            label="Confirmar Contraseña"
                            {...register("confirmPassword", { required: "Confirma la contraseña", validate: value => value === watch('password') || "Las contraseñas no coinciden" })}
                            error={!!errors.confirmPassword} helperText={errors.confirmPassword?.message}
                        />
                        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                        <Button type="submit" fullWidth variant="contained" sx={{ mt: 3 }} disabled={isSubmitting}>
                            {isSubmitting ? <CircularProgress size={24} /> : 'Guardar Nueva Contraseña'}
                        </Button>
                    </Box>
                )}
            </Paper>
        </Container>
    );
};

export default ResetPasswordPage;