// src/pages/Register/Step2_Username.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegistration } from '../../contexts/RegistrationContext';
import { Paper, Box, Typography, TextField, Button, Avatar, Stack } from '@mui/material';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';

const Step2_Username = () => {
    const navigate = useNavigate();
    const { registrationData, updateRegistrationData } = useRegistration();

    const [username, setUsername] = useState(registrationData.username || '');
    const [error, setError] = useState('');

    const handleNext = (e) => {
        e.preventDefault();
        if (username.length < 3) {
            setError('Tu @usuario debe tener al menos 3 caracteres.');
            return;
        }
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            setError('El @usuario solo puede contener letras, números y guiones bajos (_).');
            return;
        }
        setError('');
        updateRegistrationData({ username });
        navigate('/registro/paso-3');
    };

    return (
        <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 2 }}>
            <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}><AlternateEmailIcon /></Avatar>
            <Typography component="h1" variant="h5">Paso 2: Elige tu @usuario</Typography>
            <Typography color="text.secondary" sx={{mb: 2}}>Será tu identificador único en Bulk.</Typography>

            <Box component="form" onSubmit={handleNext} sx={{ mt: 1, width: '100%' }}>
                <TextField
                    label="@usuario"
                    fullWidth
                    required
                    margin="normal"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoFocus
                    error={!!error}
                    helperText={error}
                />
                <Stack direction="row" spacing={2} sx={{ mt: 3, mb: 2 }}>
                    <Button onClick={() => navigate('/registro/paso-1')} fullWidth variant="outlined">
                        Atrás
                    </Button>
                    <Button type="submit" fullWidth variant="contained">
                        Siguiente
                    </Button>
                </Stack>
            </Box>
        </Paper>
    );
};

export default Step2_Username;