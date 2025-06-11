// src/pages/Register/Step4_Password.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegistration } from '../../contexts/RegistrationContext';
import { registerUser } from '../../services/authService';
import { Paper, Box, Typography, TextField, Button, Avatar, Stack, Alert, CircularProgress } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';

const Step4_Password = () => {
    const navigate = useNavigate();
    const { registrationData, updateRegistrationData } = useRegistration();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }
        
        setLoading(true);
        setError('');
        
        try {
            // Unimos la contraseña con el resto de los datos del contexto
            const finalData = { ...registrationData, password };
            await registerUser(finalData);

            // Redirigir al login con mensaje de éxito
            navigate('/login', { state: { successMessage: '¡Registro completado! Ya puedes iniciar sesión.' } });
        } catch (err) {
            console.error("Error finalizando el registro:", err);
            setError(err.error || err.message || 'Ocurrió un error inesperado.');
            setLoading(false);
        }
    };

    return (
        <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 2 }}>
            <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}><LockIcon /></Avatar>
            <Typography component="h1" variant="h5">Último paso: Tu Contraseña</Typography>
            {error && <Alert severity="error" sx={{width:'100%', mt:2}}>{error}</Alert>}
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
                <TextField name="password" type="password" label="Contraseña" fullWidth required margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} autoFocus />
                <TextField name="confirmPassword" type="password" label="Confirmar Contraseña" fullWidth required margin="normal" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={loading} />
                
                <Stack direction="row" spacing={2} sx={{ mt: 3, mb: 2 }}>
                    <Button onClick={() => navigate('/registro/paso-3')} fullWidth variant="outlined" disabled={loading}>
                        Atrás
                    </Button>
                    <Button type="submit" fullWidth variant="contained" disabled={loading}>
                        {loading ? <CircularProgress size={24}/> : 'Finalizar Registro'}
                    </Button>
                </Stack>
            </Box>
        </Paper>
    );
};

export default Step4_Password;