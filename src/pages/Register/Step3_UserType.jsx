// RUTA: src/pages/Register/Step3_UserType.jsx
import React from 'react';
import { Typography, ToggleButtonGroup, ToggleButton, Box } from '@mui/material';
import { Controller } from 'react-hook-form';
import PersonIcon from '@mui/icons-material/Person';
import StarIcon from '@mui/icons-material/Star';

const Step3UserType = ({ control, errors }) => (
    <>
        <Typography variant="h6" gutterBottom align="center">¿Qué tipo de usuario eres?</Typography>
        <Controller name="tipo_usuario" control={control} rules={{ required: "Debes seleccionar un tipo de usuario" }} render={({ field }) => (
            <ToggleButtonGroup {...field} exclusive onChange={(e, newValue) => { if (newValue !== null) field.onChange(newValue); }} fullWidth sx={{ mt: 2 }}>
                <ToggleButton value="CREW" sx={{ flexDirection: 'column', flexGrow: 1, p: 2 }}><PersonIcon sx={{ mb: 1 }} /><Box><Typography fontWeight="bold">Crew</Typography><Typography variant="caption" display="block">Quiero unirme y explorar</Typography></Box></ToggleButton>
                <ToggleButton value="OG" sx={{ flexDirection: 'column', flexGrow: 1, p: 2 }}><StarIcon sx={{ mb: 1 }} /><Box><Typography fontWeight="bold">OG (Guru)</Typography><Typography variant="caption" display="block">Quiero crear contenido</Typography></Box></ToggleButton>
            </ToggleButtonGroup>
        )}/>
        {errors.tipo_usuario && <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>{errors.tipo_usuario.message}</Typography>}
    </>
);
export default Step3UserType;