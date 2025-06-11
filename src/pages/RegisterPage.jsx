// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { registerUser as apiRegisterUser } from '../services/authService'; //

// Importaciones de Material-UI
import Button from '@mui/material/Button'; //
import TextField from '@mui/material/TextField'; //
import Container from '@mui/material/Container'; //
import Typography from '@mui/material/Typography'; //
import Box from '@mui/material/Box'; //
import Alert from '@mui/material/Alert'; //
import CircularProgress from '@mui/material/CircularProgress'; //
import Radio from '@mui/material/Radio'; //
import RadioGroup from '@mui/material/RadioGroup'; //
import FormControlLabel from '@mui/material/FormControlLabel'; //
import FormControl from '@mui/material/FormControl'; //
import FormLabel from '@mui/material/FormLabel'; //
// Grid ya no es necesario para el enlace, pero se mantiene por si lo usas en otro lado.
// import Grid from '@mui/material/Grid'; 
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1'; // Ícono para registro
import Link from '@mui/material/Link';

const RegisterPage = () => {
    const [email, setEmail] = useState(''); //
    const [password, setPassword] = useState(''); //
    const [confirmPassword, setConfirmPassword] = useState(''); //
    const [userType, setUserType] = useState('MEMBER'); //
    const [error, setError] = useState(''); //
    const [successMessage, setSuccessMessage] = useState(''); //
    const [loading, setLoading] = useState(false); //

    const navigate = useNavigate(); //

    const handleSubmit = async (event) => { //
        event.preventDefault();
        setError('');
        setSuccessMessage('');
        setLoading(true);

        if (!email || !password || !confirmPassword || !userType) {
            setError('Todos los campos son obligatorios.');
            setLoading(false);
            return;
        }
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            setLoading(false);
            return;
        }

        try {
            const userData = { email, password, userType }; //
            const response = await apiRegisterUser(userData); //
            setSuccessMessage(response.mensaje || '¡Registro exitoso! Ahora puedes iniciar sesión.');
            setEmail(''); setPassword(''); setConfirmPassword(''); // setUserType('MEMBER');
            setTimeout(() => { navigate('/login'); }, 3000); //
        } catch (err) {
            console.error('Error en handleSubmit de RegisterPage:', err);
            if (err && err.errors && Array.isArray(err.errors) && err.errors.length > 0) {
                setError(err.errors[0].msg || 'Error al registrar el usuario.');
            } else {
                const errorMessage = typeof err === 'string' ? err : err.message;
                setError(errorMessage || 'Error al registrar el usuario. Intenta de nuevo.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container 
            component="main" 
            maxWidth="xs" 
            sx={{ 
                mt: { xs: 4, sm: 8 }, // Margen superior, un poco menos en xs por el contenido más largo
                mb: 4, // Margen inferior para dar espacio
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}
        >
            <Paper 
                elevation={3}
                sx={{
                    p: { xs: 2, sm: 3, md: 4 }, // Padding responsivo
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '100%',
                    borderRadius: (theme) => theme.shape.borderRadius * 1.5
                }}
            >
                <Avatar sx={{ m: 1, bgcolor: 'secondary.main', width: 56, height: 56 }}>
                    <PersonAddAlt1Icon fontSize="medium" />
                </Avatar>
                <Typography component="h1" variant="h5" sx={{ mt: 1 }}>
                    Crear Cuenta en Bulk
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}> {/* Margen inferior reducido */}
                    Únete para descubrir y gestionar comunidades.
                </Typography>
                
                {/* Mensajes de error o éxito */}
                {error && !successMessage && <Alert severity="error" sx={{ width: '100%', mb: 2, mt: 1 }}>{error}</Alert>}
                {successMessage && <Alert severity="success" sx={{ width: '100%', mb: 2, mt: 1 }}>{successMessage}</Alert>}
                
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%', mt: successMessage || error ? 0 : 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Correo Electrónico"
                        name="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading || !!successMessage}
                        autoFocus
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Contraseña"
                        type="password"
                        id="password"
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading || !!successMessage}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="confirmPassword"
                        label="Confirmar Contraseña"
                        type="password"
                        id="confirmPassword"
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={loading || !!successMessage}
                    />
                    <FormControl component="fieldset" margin="normal" fullWidth required disabled={loading || !!successMessage}>
                        <FormLabel component="legend" sx={{ mb: 0.5, fontSize: '0.9rem', color: 'text.secondary' }}>Tipo de Usuario</FormLabel>
                        <RadioGroup
                            row
                            aria-label="tipo de usuario"
                            name="userType"
                            value={userType}
                            onChange={(e) => setUserType(e.target.value)}
                        >
                            <FormControlLabel value="MEMBER" control={<Radio size="small" />} label="Miembro" />
                            <FormControlLabel value="GURU" control={<Radio size="small" />} label="Gurú" />
                        </RadioGroup>
                    </FormControl>

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        sx={{ 
                            mt: 2, // Margen superior ajustado
                            mb: 2, 
                            py: 1.2,
                            fontSize: '1rem'
                        }}
                        disabled={loading || !!successMessage}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Registrarme'}
                    </Button>
                    
                    <Box sx={{ textAlign: 'center', mt: 2.5, width: '100%' }}>
                        <Link component={RouterLink} to="/login" variant="body2" sx={{ color: 'primary.main' }}>
                            ¿Ya tienes una cuenta? Inicia sesión
                        </Link>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default RegisterPage;