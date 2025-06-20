// RUTA: src/pages/Register/Step1_PersonalInfo.jsx

import React from 'react';
import { TextField, Typography, Grid, Autocomplete } from '@mui/material';
import { Controller } from 'react-hook-form';
import { locations } from '../../data/locations';

const Step1PersonalInfo = ({ register, errors, control }) => { 
    const countryNames = locations.map(item => item.name);
    return (
        <>
            <Typography variant="h6" gutterBottom>Información Personal</Typography>
            <Grid container spacing={3} sx={{mt: 1}}>
                <Grid item xs={12}>
                    <TextField fullWidth label="Nombre y Apellido" {...register("name", { required: "Tu nombre es obligatorio" })} error={!!errors.name} helperText={errors.name?.message}/>
                </Grid>
                <Grid item xs={12}>
                    <TextField fullWidth label="Fecha de Nacimiento" type="date" InputLabelProps={{ shrink: true }} {...register("fechaDeNacimiento", { required: "La fecha de nacimiento es obligatoria" })} error={!!errors.fechaDeNacimiento} helperText={errors.fechaDeNacimiento?.message}/>
                </Grid>
                <Grid item xs={12}>
                    <Controller name="paisDeNacimiento" control={control} rules={{ required: "El país es obligatorio" }} render={({ field: { onChange, value } }) => (
                        <Autocomplete 
                            options={countryNames} 
                            value={value || null} 
                            onChange={(e, newValue) => onChange(newValue)} 
                            // --- CORRECCIÓN DE ESTILO DEL MENÚ DESPLEGABLE ---
                            // Le da al menú una altura máxima y lo hace scrolleable
                            ListboxProps={{ style: { maxHeight: '200px' } }}
                            renderInput={(params) => (
                                <TextField {...params} label="País de Nacimiento" error={!!errors.paisDeNacimiento} helperText={errors.paisDeNacimiento?.message}/>
                            )} 
                        />
                    )}/>
                </Grid>
                
                {/* --- CAMPOS NUEVOS AÑADIDOS --- */}
                <Grid item xs={12} sm={6}>
                    <TextField 
                        fullWidth 
                        label="Domicilio"
                        {...register("domicilio")} 
                        error={!!errors.domicilio} 
                        helperText={errors.domicilio?.message}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField 
                        fullWidth 
                        label="Número de Celular"
                        type="tel"
                        {...register("celular")} 
                        error={!!errors.celular} 
                        helperText={errors.celular?.message}
                    />
                </Grid>
            </Grid>
        </>
    );
};

export default Step1PersonalInfo;