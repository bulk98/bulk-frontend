// RUTA: src/pages/Register/Step4_Password.jsx
import React from 'react';
import { TextField, Typography, Grid } from '@mui/material';

const Step4Password = ({ register, errors, getValues }) => (
    <>
        <Typography variant="h6" gutterBottom>Crea tu Contraseña Segura</Typography>
        <Grid container spacing={3} sx={{mt: 1}}>
            <Grid item xs={12}><TextField fullWidth label="Contraseña" type="password" {...register("password", { required: "La contraseña es obligatoria", minLength: { value: 6, message: "Mínimo 6 caracteres" }})} error={!!errors.password} helperText={errors.password?.message}/></Grid>
            <Grid item xs={12}><TextField fullWidth label="Confirmar Contraseña" type="password" {...register("confirmPassword", { required: "Confirma tu contraseña", validate: value => value === getValues("password") || "Las contraseñas no coinciden" })} error={!!errors.confirmPassword} helperText={errors.confirmPassword?.message}/></Grid>
        </Grid>
    </>
);
export default Step4Password;