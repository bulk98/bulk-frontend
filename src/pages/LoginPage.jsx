// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

// Importaciones de Material-UI
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Link from '@mui/material/Link'; // Asegúrate que Link de MUI esté importado

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setLoading(true);

        if (!email || !password) {
            setError('Por favor, ingresa tu correo y contraseña.');
            setLoading(false);
            return;
        }

        try {
            await login(email, password);
            navigate('/'); 
        } catch (err) {
            console.error('Error en handleSubmit de LoginPage:', err);
            setError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container 
            component="main" 
            maxWidth="xs" 
            sx={{ 
                mt: { xs: 6, sm: 8 }, // Margen superior ajustado para diferentes pantallas
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                pb: 4, // Padding inferior para dar espacio
            }}
        >
            <Paper 
                elevation={3} 
                sx={{
                    p: { xs: 3, sm: 4 }, // Padding interno del Paper
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '100%', 
                    borderRadius: (theme) => theme.shape.borderRadius * 1.5 // Bordes redondeados
                }}
            >
                <Avatar sx={{ m: 1, bgcolor: 'secondary.main', width: 56, height: 56 }}> 
                    <LockOutlinedIcon fontSize="medium" />
                </Avatar>
                <Typography component="h1" variant="h5" sx={{ mt: 1 }}> 
                    Bienvenido a Bulk
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Inicia sesión para continuar
                </Typography>
                
                {error && <Alert severity="error" sx={{ width: '100%', mb: 2, mt: 1 }}>{error}</Alert>}
                
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Correo Electrónico"
                        name="email"
                        autoComplete="email"
                        autoFocus
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
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
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        sx={{ mb: 1 }} // Margen inferior ajustado
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained" 
                        color="primary"     
                        sx={{ 
                            mt: 2, // Margen superior ajustado
                            mb: 2, 
                            py: 1.2,
                            fontSize: '1rem' // Tamaño de fuente un poco más grande para el botón principal
                        }} 
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Ingresar'}
                    </Button>
                    
                    {/* ENLACE DE REGISTRO CENTRADO */}
                    <Box sx={{ textAlign: 'center', mt: 2.5, width: '100%' }}>
                        <Link component={RouterLink} to="/registro" variant="body2" sx={{ color: 'primary.main' }}>
                            ¿No tienes una cuenta? Regístrate
                        </Link>
                    </Box>

                    {/* ENLACE OPCIONAL PARA "OLVIDASTE CONTRASEÑA" (DESCOMENTAR SI LO NECESITAS) */}
                    {/*
                    <Box sx={{ textAlign: 'center', mt: 1.5, width: '100%' }}>
                        <Link component={RouterLink} to="/forgot-password" variant="caption" sx={{ color: 'text.secondary' }}>
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </Box>
                    */}

                </Box> 
            </Paper>
        </Container>
    );
};

export default LoginPage;