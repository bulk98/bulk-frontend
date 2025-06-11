// src/pages/Register/Step3_UserType.jsx
import React, { useEffect } from 'react'; // 1. Importar useEffect
import { useNavigate } from 'react-router-dom';
import { useRegistration } from '../../contexts/RegistrationContext';
import { Paper, Box, Typography, Button, Stack, RadioGroup, FormControlLabel, Radio } from '@mui/material';

const Step3_UserType = () => {
    const navigate = useNavigate();
    const { registrationData, updateRegistrationData } = useRegistration();

    // 2. ESTE USEEFFECT ES LA SOLUCIÓN
    // Asegura que el valor por defecto 'CREW' se guarde en el contexto
    // si el usuario no ha seleccionado explícitamente otro valor.
    useEffect(() => {
        if (!registrationData.tipo_usuario) {
            updateRegistrationData({ tipo_usuario: 'CREW' });
        }
    }, []); // El array vacío asegura que solo se ejecute una vez al montar

    const handleChange = (e) => {
        updateRegistrationData({ tipo_usuario: e.target.value });
    };

    return (
        <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 2 }}>
            <Typography component="h1" variant="h5">Paso 3: ¿Qué rol quieres tener?</Typography>
            <Typography color="text.secondary" sx={{mb: 3, textAlign: 'center'}}>Elige cómo quieres empezar tu viaje en Bulk.</Typography>
            <RadioGroup
                aria-labelledby="user-type-group-label"
                name="tipo_usuario"
                value={registrationData.tipo_usuario || 'CREW'} // 3. Usamos || 'CREW' como fallback
                onChange={handleChange}
                sx={{ width: '100%', gap: 2 }}
            >
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <FormControlLabel value="OG" control={<Radio />} label={
                        <Typography variant="h6" sx={{fontWeight:'bold'}}>Quiero ser un OG</Typography>
                    }/>
                    <Typography variant="body2" sx={{pl: 4, color: 'text.secondary'}}>Como OG (Original Guru), podrás crear y monetizar tus propias comunidades exclusivas, gestionar miembros y compartir contenido premium.</Typography>
                </Paper>

                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <FormControlLabel value="CREW" control={<Radio />} label={
                         <Typography variant="h6" sx={{fontWeight:'bold'}}>Quiero ser parte de la CREW</Typography>
                    }/>
                     <Typography variant="body2" sx={{pl: 4, color: 'text.secondary'}}>Como miembro de la CREW, podrás unirte a comunidades, acceder a contenido exclusivo, interactuar y formar parte de la acción.</Typography>
                </Paper>
            </RadioGroup>
            <Stack direction="row" spacing={2} sx={{ mt: 3, mb: 2, width: '100%' }}>
                <Button onClick={() => navigate('/registro/paso-2')} fullWidth variant="outlined">
                    Atrás
                </Button>
                <Button onClick={() => navigate('/registro/paso-4')} fullWidth variant="contained">
                    Siguiente
                </Button>
            </Stack>
        </Paper>
    );
};

export default Step3_UserType;