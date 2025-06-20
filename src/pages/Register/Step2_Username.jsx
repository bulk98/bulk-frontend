// RUTA: src/pages/Register/Step2_Username.jsx
import React from 'react';
import { TextField, Typography, Grid } from '@mui/material';

const Step2Username = ({ register, errors }) => (
    <>
        <Typography variant="h6" gutterBottom>Tu Identidad Digital</Typography>
        <Grid container spacing={3} sx={{mt: 1}}>
            <Grid item xs={12}><TextField fullWidth label="Nombre de usuario (@usuario)" {...register("username", { required: "El nombre de usuario es obligatorio", minLength: { value: 3, message: "Mínimo 3 caracteres" }, pattern: { value: /^[a-zA-Z0-9_]+$/, message: "Solo letras, números y guion bajo" } })} error={!!errors.username} helperText={errors.username?.message}/></Grid>
            <Grid item xs={12}><TextField fullWidth label="Correo Electrónico" type="email" {...register("email", { required: "El correo es obligatorio", pattern: { value: /^\S+@\S+$/i, message: "Formato de correo inválido" } })} error={!!errors.email} helperText={errors.email?.message}/></Grid>
        </Grid>
    </>
);
export default Step2Username;