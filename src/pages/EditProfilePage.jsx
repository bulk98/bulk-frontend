// RUTA: src/pages/EditProfilePage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { updateUserProfile, uploadUserAvatar } from '../services/userService';
import { locations } from '../data/locations';
import {
    Container, Paper, Typography, Grid, TextField, Button, Box, CircularProgress,
    Alert, Snackbar, Autocomplete, Avatar, Badge, IconButton, Tabs, Tab
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

const TabPanel = ({ children, value, index, ...other }) => (
    <div
        role="tabpanel"
        hidden={value !== index}
        id={`profile-tabpanel-${index}`}
        aria-labelledby={`profile-tab-${index}`}
        {...other}
    >
        {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
);

const EditProfilePage = () => {
    const { user, refreshAuthUserProfile } = useAuth();
    const navigate = useNavigate();
    const [tabValue, setTabValue] = useState(0);
    const [serverError, setServerError] = useState(null); // MODIFICADO: Usar null para una comprobación más limpia
    const [successMessage, setSuccessMessage] = useState('');
    const [openSnackbar, setOpenSnackbar] = useState(false);

    // Se elimina la ref, ya que react-hook-form puede manejar el foco si es necesario.
    // const usernameRef = React.useRef(null); 

    const {
        register, handleSubmit, control, watch, reset,
        formState: { errors, isSubmitting, isDirty }
    } = useForm({
        defaultValues: {
            name: '', username: '', bio: '', avatarFile: null,
            fechaDeNacimiento: null, paisDeNacimiento: null, ciudadDeNacimiento: null,
            domicilio: '', celular: ''
        }
    });

    useEffect(() => {
        if (user) {
            reset({
                name: user.name || '',
                username: user.username || '',
                bio: user.bio || '',
                fechaDeNacimiento: user.fechaDeNacimiento ? new Date(user.fechaDeNacimiento).toISOString().split('T')[0] : null,
                paisDeNacimiento: user.paisDeNacimiento || null,
                ciudadDeNacimiento: user.ciudadDeNacimiento || null,
                domicilio: user.domicilio || '',
                celular: user.celular || ''
            });
        }
    }, [user, reset]);

    const countryOptions = useMemo(() => locations.map(c => c.name), []);
    const selectedCountryName = watch('paisDeNacimiento');
    const cityOptions = useMemo(() => {
        if (!selectedCountryName) return [];
        const selectedCountryData = locations.find(c => c.name === selectedCountryName);
        return selectedCountryData ? selectedCountryData.states : [];
    }, [selectedCountryName]);

    const handleTabChange = (event, newValue) => setTabValue(newValue);

    const onSubmit = async (data) => {
        setServerError(null); // NUEVO: Limpiar cualquier error previo al iniciar el envío.
        setSuccessMessage('');

        try {
            const { avatarFile, ...profileData } = data;

            // No se toca esta lógica de fecha, ya que indicas que funciona.
            if (typeof profileData.fechaDeNacimiento === 'string' && profileData.fechaDeNacimiento.trim() === '') {
                profileData.fechaDeNacimiento = null;
            } else if (profileData.fechaDeNacimiento) {
                profileData.fechaDeNacimiento = new Date(profileData.fechaDeNacimiento).toISOString();
            }

            console.log('Datos que se enviarán al backend:', profileData);
            await updateUserProfile(profileData);
            
            if (avatarFile && avatarFile.length > 0) {
                await uploadUserAvatar(avatarFile[0]);
            }

            await refreshAuthUserProfile();
            
            setSuccessMessage('✅ Perfil actualizado con éxito.');
            setOpenSnackbar(true); // Muestra el snackbar de éxito

            setTimeout(() => {
                navigate(`/perfil/${user.id}`);
            }, 2000);

        } catch (error) {
            console.error("Error al actualizar el perfil:", error);
            // MODIFICADO: Lógica de manejo de errores simplificada y robusta.
            const errorMessage = error.error || 'Ocurrió un error inesperado al guardar.';
            setServerError(errorMessage);
        }
    };

    if (!user) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>Editar Perfil</Typography>
            <Paper sx={{ borderRadius: 2 }}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs value={tabValue} onChange={handleTabChange} aria-label="pestañas de perfil">
                            <Tab label="Información Pública" id="profile-tab-0" />
                            <Tab label="Información Privada" id="profile-tab-1" />
                        </Tabs>
                    </Box>

                    <TabPanel value={tabValue} index={0}>
                        <Grid container spacing={3} alignItems="flex-start">
                            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                                <Badge
                                    overlap="circular"
                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                    badgeContent={
                                        <IconButton color="primary" component="label" disabled={isSubmitting}>
                                            <input hidden accept="image/*" type="file" {...register("avatarFile")} />
                                            <PhotoCamera />
                                        </IconButton>
                                    }
                                >
                                    <Avatar sx={{ width: 120, height: 120, fontSize: '3rem' }} src={user.avatarUrl} />
                                </Badge>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Nombre y Apellido" {...register("name")} error={!!errors.name} helperText={errors.name?.message} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                {/* MODIFICADO: El campo de texto ya no necesita lógica de error compleja. */}
                                {/* React-hook-form manejará los errores de validación del lado del cliente. */}
                                <TextField
                                    fullWidth
                                    label="Nombre de usuario (@...)"
                                    {...register("username")}
                                    error={!!errors.username}
                                    helperText={errors.username?.message}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField fullWidth label="Biografía" multiline rows={4} InputLabelProps={{ shrink: true }} {...register("bio")} />
                            </Grid>
                        </Grid>
                    </TabPanel>

                    <TabPanel value={tabValue} index={1}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Correo Electrónico" value={user.email} disabled InputLabelProps={{ shrink: true }} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="fechaDeNacimiento"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            fullWidth
                                            label="Fecha de Nacimiento"
                                            type="date"
                                            InputLabelProps={{ shrink: true }}
                                            value={field.value || ''}
                                            disabled // El campo está deshabilitado como en tu código original
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Domicilio" {...register("domicilio")} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Celular" type="tel" {...register("celular")} />
                            </Grid>
                            <Grid item xs={12}>
                                <Controller name="paisDeNacimiento" control={control} render={({ field }) => (
                                    <Autocomplete
                                        options={countryOptions}
                                        {...field}
                                        onChange={(e, val) => field.onChange(val)}
                                        ListboxProps={{ style: { maxHeight: '200px' } }}
                                        renderInput={(params) => <TextField {...params} fullWidth label="País de Nacimiento" InputLabelProps={{ shrink: true }} sx={{ minWidth: 300 }} />}
                                    />
                                )} />
                            </Grid>
                            <Grid item xs={12}>
                                <Controller name="ciudadDeNacimiento" control={control} render={({ field }) => (
                                    <Autocomplete
                                        options={cityOptions}
                                        {...field}
                                        onChange={(e, val) => field.onChange(val)}
                                        disabled={!selectedCountryName || cityOptions.length === 0}
                                        ListboxProps={{ style: { maxHeight: '200px' } }}
                                        renderInput={(params) => <TextField {...params} fullWidth label="Ciudad/Departamento" InputLabelProps={{ shrink: true }} sx={{ minWidth: 300 }} />}
                                    />
                                )} />
                            </Grid>
                        </Grid>
                    </TabPanel>

                    {/* NUEVO: Componente Alert para mostrar el error del servidor de forma clara y centralizada */}
                    {serverError && (
                        <Box sx={{ p: 2, pb: 0 }}>
                             <Alert severity="error" onClose={() => setServerError(null)}>
                                {serverError}
                            </Alert>
                        </Box>
                    )}
                    
                    {/* El Snackbar se mantiene para los mensajes de éxito */}
                    <Snackbar open={openSnackbar} autoHideDuration={4000} onClose={() => setOpenSnackbar(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                        <Alert onClose={() => setOpenSnackbar(false)} severity="success" sx={{ width: '100%' }}>
                            {successMessage}
                        </Alert>
                    </Snackbar>

                    <Box sx={{ p: 3, pt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button type="submit" variant="contained" disabled={isSubmitting || !isDirty}>
                            {isSubmitting ? <CircularProgress size={24} /> : 'Guardar Cambios'}
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Container>
    );
};

export default EditProfilePage;