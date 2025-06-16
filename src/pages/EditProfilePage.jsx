// src/pages/EditProfilePage.jsx
import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile, updateUserProfile } from '../services/userService';
import { countries } from '/src/data/locations.js';
import {
    Container, Typography, Paper, Box, CircularProgress, Alert, Button,
    TextField, Grid, Stack, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

const EditProfilePage = () => {
    const { user: authUser, loadingAuth, updateAuthUser } = useAuth();
    const [successMessage, setSuccessMessage] = useState('');
    const [serverError, setServerError] = useState('');
    const [loadingProfile, setLoadingProfile] = useState(true);

    const {
        control,
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting, isDirty }
    } = useForm();

    const paisSeleccionado = watch("paisDeNacimiento");
    const ciudadesDisponibles = countries.find(c => c.name === paisSeleccionado)?.states || [];

    useEffect(() => {
        if (loadingAuth || !authUser) return;
        
        getUserProfile().then(profileData => {
            Object.keys(control._defaultValues).forEach(key => {
                setValue(key, profileData[key] || '', { shouldValidate: true, shouldDirty: false });
            });
        }).catch(err => {
            setServerError('No se pudo cargar tu información de perfil.');
        }).finally(() => {
            setLoadingProfile(false);
        });
    }, [loadingAuth, authUser, setValue, control]);

    const onSubmit = async (data) => {
        setSuccessMessage('');
        setServerError('');
        try {
            const updatedProfile = await updateUserProfile(data);
            updateAuthUser(updatedProfile);
            setSuccessMessage('¡Perfil actualizado con éxito!');
        } catch (err) {
            setServerError(err.message || 'Ocurrió un error al guardar tu perfil.');
        }
    };

    if (loadingAuth || loadingProfile) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="md">
            <Paper sx={{ p: { xs: 2, sm: 4 }, mt: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Editar Mi Perfil
                </Typography>
                
                <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 3 }}>
                    {serverError && <Alert severity="error" sx={{ mb: 2 }}>{serverError}</Alert>}
                    {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}
                    
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Nombre y Apellidos" {...register("name", { required: "El nombre es obligatorio" })} error={!!errors.name} helperText={errors.name?.message} disabled={isSubmitting} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="@usuario" {...register("username", { required: "El @usuario es obligatorio" })} error={!!errors.username} helperText={errors.username?.message} disabled={isSubmitting} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Correo Electrónico" defaultValue={authUser?.email || ''} disabled helperText="El correo electrónico no se puede modificar." InputLabelProps={{ shrink: true }} />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth variant="outlined" disabled={isSubmitting}>
                                <InputLabel>País</InputLabel>
                                <Controller
                                    name="paisDeNacimiento"
                                    control={control}
                                    defaultValue=""
                                    render={({ field }) => (
                                        <Select
                                            label="País"
                                            {...field}
                                            onChange={(e) => {
                                                field.onChange(e);
                                                setValue('ciudadDeNacimiento', '');
                                            }}
                                            // === CORRECCIÓN FINAL DE TAMAÑO ===
                                            sx={{ minWidth: 120 }}
                                        >
                                            {countries.map(c => <MenuItem key={c.name} value={c.name}>{c.name}</MenuItem>)}
                                        </Select>
                                    )}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                           <FormControl fullWidth variant="outlined" disabled={isSubmitting || !paisSeleccionado}>
                                <InputLabel>Ciudad / Estado</InputLabel>
                                <Controller
                                    name="ciudadDeNacimiento"
                                    control={control}
                                    defaultValue=""
                                    render={({ field }) => (
                                        <Select
                                            label="Ciudad / Estado"
                                            {...field}
                                            // === CORRECCIÓN FINAL DE TAMAÑO ===
                                            sx={{ minWidth: 120 }}
                                        >
                                            <MenuItem value=""><em>Selecciona una opción</em></MenuItem>
                                            {ciudadesDisponibles.map(city => <MenuItem key={city} value={city}>{city}</MenuItem>)}
                                        </Select>
                                    )}
                                />
                            </FormControl>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Domicilio (Opcional)" {...register("domicilio")} disabled={isSubmitting} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Teléfono / Celular (Opcional)" {...register("celular")} disabled={isSubmitting} />
                        </Grid>
                    </Grid>
                    <Stack direction="row" justifyContent="flex-end" sx={{ mt: 4 }}>
                        <Button type="submit" variant="contained" disabled={!isDirty || isSubmitting} startIcon={isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}>
                            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </Stack>
                </Box>
            </Paper>
        </Container>
    );
};

export default EditProfilePage;