// RUTA: src/pages/LoginPage.jsx

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import PublicNavbar from '../components/layout/PublicNavbar';

// Importaciones de MUI
import { Avatar, Button, TextField, Link, Grid, Box, Typography, Container, CircularProgress, Alert, Paper, Divider } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import GoogleIcon from '@mui/icons-material/Google';

const LoginPage = () => {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [serverError, setServerError] = useState('');

    const from = location.state?.from?.pathname || "/";

    // SVG para el fondo con patrón de "B"
    const svgPattern = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Ctext x='50%25' y='50%25' font-size='90' font-family='sans-serif' font-weight='bold' fill='rgba(0,0,0,0.03)' text-anchor='middle' dominant-baseline='middle'%3EB%3C/text%3E%3C/svg%3E")`;

    const onSubmit = async (data) => {
        setServerError('');
        try {
            await login(data.email, data.password);
            navigate(from, { replace: true });
        } catch (error) {
            const errorMessage = error.error || "Credenciales inválidas o error del servidor.";
            setServerError(errorMessage);
        }
    };

    return (
        // Se utiliza un Box como contenedor principal en lugar de un Fragment (<>) para mayor robustez
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {/* Contenedor para el fondo que ocupa toda la pantalla */}
            <Box
              sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: -1,
                backgroundColor: '#f4f6f8',
                backgroundImage: svgPattern,
              }}
            />

            <PublicNavbar />
            
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 2
                }}
            >
                <Container component="div" maxWidth="xs">
                    <Paper 
                        elevation={6}
                        sx={{
                            padding: { xs: 3, sm: 4 },
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            borderRadius: 2
                        }}
                    >
                        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                            <LockOutlinedIcon />
                        </Avatar>
                        <Typography component="h1" variant="h5">
                            Iniciar Sesión
                        </Typography>

                        {/* BOTÓN DE GOOGLE */}
                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<GoogleIcon />}
                            sx={{ mt: 3, mb: 2 }}
                            // Este es un enlace normal, no un botón de submit
                            component="a" 
                            href={`${import.meta.env.VITE_BACKEND_URL}/auth/google`}
                        >
                            Continuar con Google
                        </Button>
                        
                        <Divider sx={{ width: '100%', my: 1 }}>O</Divider>
                        
                        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1, width: '100%' }}>
                            {serverError && <Alert severity="error" sx={{ width: '100%', mt: 2, mb: 1 }}>{serverError}</Alert>}
                            
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Correo Electrónico"
                                autoComplete="email"
                                autoFocus
                                disabled={isSubmitting}
                                {...register("email", { 
                                    required: "El correo es obligatorio",
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Correo electrónico inválido"
                                    }
                                })}
                                error={!!errors.email}
                                helperText={errors.email?.message}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Contraseña"
                                type="password"
                                id="password"
                                autoComplete="current-password"
                                disabled={isSubmitting}
                                {...register("password", { required: "La contraseña es obligatoria" })}
                                error={!!errors.password}
                                helperText={errors.password?.message}
                            />
                            
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                disabled={isSubmitting}
                                sx={{ mt: 3, mb: 2 }}
                            >
                                {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Iniciar Sesión'}
                            </Button>
                            
                            <Grid container justifyContent="space-between">
                                <Grid item>
                                    <Link component={RouterLink} to="/forgot-password" variant="body2">
                                        ¿Olvidaste tu contraseña?
                                    </Link>
                                </Grid>
                                <Grid item>
                                    <Link component={RouterLink} to="/register" variant="body2">
                                        ¿No tienes una cuenta? Regístrate
                                    </Link>
                                </Grid>
                            </Grid>
                        </Box>
                    </Paper>
                </Container>
            </Box>
        </Box>
    );
};

export default LoginPage;