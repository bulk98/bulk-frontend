// src/pages/Register/Step1_PersonalInfo.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegistration } from '../../contexts/RegistrationContext';
import { Paper, Box, Typography, TextField, Button, Avatar } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';

const Step1_PersonalInfo = () => {
    const navigate = useNavigate();
    const { registrationData, updateRegistrationData } = useRegistration();

    // Estado local para los campos de este paso
    const [formData, setFormData] = useState({
        name: registrationData.name || '',
        email: registrationData.email || '',
        fechaDeNacimiento: registrationData.fechaDeNacimiento || '',
        // Añade aquí los otros campos si quieres validarlos localmente
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleNext = (e) => {
        e.preventDefault();
        // Aquí iría la validación de los campos antes de continuar
        updateRegistrationData(formData);
        navigate('/registro/paso-2'); // Navega al siguiente paso
    };

    return (
        <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 2 }}>
            <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}><PersonIcon /></Avatar>
            <Typography component="h1" variant="h5">Paso 1: Cuéntanos sobre ti</Typography>
            <Box component="form" onSubmit={handleNext} sx={{ mt: 3, width: '100%' }}>
                <TextField name="name" label="Nombres y Apellidos" fullWidth required margin="normal" value={formData.name} onChange={handleChange} />
                <TextField name="email" type="email" label="Correo Electrónico" fullWidth required margin="normal" value={formData.email} onChange={handleChange} />
                <TextField name="fechaDeNacimiento" label="Fecha de Nacimiento" type="date" fullWidth required margin="normal" InputLabelProps={{ shrink: true }} value={formData.fechaDeNacimiento} onChange={handleChange}/>
                {/* Aquí puedes añadir los demás campos: pais, ciudad, domicilio, celular */}

                <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2, py: 1.5 }}>
                    Siguiente
                </Button>
            </Box>
        </Paper>
    );
};

export default Step1_PersonalInfo;