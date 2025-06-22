// RUTA: src/pages/EditProfilePage.jsx
import React, { useState, useEffect, useMemo } from 'react';
// MODIFICADO: Se importa 'useForm as usePasswordForm' para tener una segunda instancia del hook
import { useForm, Controller, useForm as usePasswordForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
// MODIFICADO: Se importa 'changePassword'
import { updateUserProfile, uploadUserAvatar, changePassword } from '../services/userService';
import { locations } from '../data/locations';
import {
    Container, Paper, Typography, Grid, TextField, Button, Box, CircularProgress,
    Alert, Snackbar, Autocomplete, Avatar, Badge, IconButton, Tabs, Tab
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
// NUEVO: Importamos el ícono para la nueva pestaña
import SecurityIcon from '@mui/icons-material/Security';

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

// NUEVO: Componente autocontenido para el formulario de cambio de contraseña
const ChangePasswordForm = () => {
    // Esta es una instancia separada de react-hook-form para no entrar en conflicto con el form principal
    const { handleSubmit, register, formState: { errors, isSubmitting }, watch, reset } = usePasswordForm();
    const [serverError, setServerError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const onSubmitPassword = async (data) => {
        setServerError(null);
        setSuccessMessage(null);
        try {
            const response = await changePassword(data);
            setSuccessMessage(response.message);
            reset(); // Limpia los campos del formulario tras el éxito
        } catch (error) {
            setServerError(error.error || 'Ocurrió un error inesperado.');
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit(onSubmitPassword)} sx={{ maxWidth: 400 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Cambiar Contraseña</Typography>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <TextField fullWidth type="password" label="Contraseña Actual" {...register("currentPassword", { required: "Este campo es obligatorio." })} error={!!errors.currentPassword} helperText={errors.currentPassword?.message} />
                </Grid>
                <Grid item xs={12}>
                    <TextField fullWidth type="password" label="Nueva Contraseña" {...register("newPassword", { required: "La nueva contraseña es obligatoria.", minLength: { value: 6, message: "Mínimo 6 caracteres." } })} error={!!errors.newPassword} helperText={errors.newPassword?.message} />
                </Grid>
                <Grid item xs={12}>
                    <TextField fullWidth type="password" label="Confirmar Nueva Contraseña" {...register("confirmPassword", { required: "Confirma la nueva contraseña.", validate: value => value === watch('newPassword') || "Las contraseñas no coinciden." })} error={!!errors.confirmPassword} helperText={errors.confirmPassword?.message} />
                </Grid>
            </Grid>
            {serverError && <Alert severity="error" sx={{ mt: 2 }} onClose={() => setServerError(null)}>{serverError}</Alert>}
            {successMessage && <Alert severity="success" sx={{ mt: 2 }}>{successMessage}</Alert>}
            <Button type="submit" variant="contained" sx={{ mt: 3 }} disabled={isSubmitting}>
                {isSubmitting ? <CircularProgress size={24} /> : "Actualizar Contraseña"}
            </Button>
        </Box>
    );
};


const EditProfilePage = () => {
    const { user, refreshAuthUserProfile } = useAuth();
    const navigate = useNavigate();
    const [tabValue, setTabValue] = useState(0);
    const [serverError, setServerError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [openSnackbar, setOpenSnackbar] = useState(false);

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
        setServerError(null);
        setSuccessMessage('');
        try {
            const { avatarFile, ...profileData } = data;
            if (typeof profileData.fechaDeNacimiento === 'string' && profileData.fechaDeNacimiento.trim() === '') {
                profileData.fechaDeNacimiento = null;
            } else if (profileData.fechaDeNacimiento) {
                profileData.fechaDeNacimiento = new Date(profileData.fechaDeNacimiento).toISOString();
            }
            await updateUserProfile(profileData);
            if (avatarFile && avatarFile.length > 0) {
                await uploadUserAvatar(avatarFile[0]);
            }
            await refreshAuthUserProfile();
            setSuccessMessage('✅ Perfil actualizado con éxito.');
            setOpenSnackbar(true);
            setTimeout(() => {
                navigate(`/perfil/${user.id}`);
            }, 2000);
        } catch (error) {
            const errorMessage = error.error || 'Ocurrió un error inesperado al guardar.';
            setServerError(errorMessage);
        }
    };

    if (!user) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>Editar Perfil</Typography>
            <Paper sx={{ borderRadius: 2 }}>
                {/* El form principal solo envuelve los tabs y paneles que usan el botón de 'Guardar Cambios' */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabValue} onChange={handleTabChange} aria-label="pestañas de perfil">
                        <Tab label="Información Pública" id="profile-tab-0" />
                        <Tab label="Información Privada" id="profile-tab-1" />
                        {/* NUEVO: Pestaña de Seguridad */}
                        <Tab label="Seguridad" icon={<SecurityIcon />} iconPosition="start" id="profile-tab-2" />
                    </Tabs>
                </Box>

                {/* Este formulario es solo para los tabs 0 y 1 */}
                <form onSubmit={handleSubmit(onSubmit)}>
                    <TabPanel value={tabValue} index={0}>
                        <Grid container spacing={3} alignItems="flex-start">
                            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                                <Badge overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} badgeContent={ <IconButton color="primary" component="label" disabled={isSubmitting}> <input hidden accept="image/*" type="file" {...register("avatarFile")} /> <PhotoCamera /> </IconButton> }>
                                    <Avatar sx={{ width: 120, height: 120, fontSize: '3rem' }} src={user.avatarUrl} />
                                </Badge>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Nombre y Apellido" {...register("name")} error={!!errors.name} helperText={errors.name?.message} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Nombre de usuario (@...)" {...register("username", { required: "El nombre de usuario es obligatorio", minLength: { value: 3, message: "Mínimo 3 caracteres" }, pattern: { value: /^[a-zA-Z0-9_]+$/, message: "Solo letras, números y guion bajo (_). Sin espacios." } })} error={!!errors.username} helperText={errors.username?.message} />
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
                                <Controller name="fechaDeNacimiento" control={control} render={({ field }) => ( <TextField fullWidth label="Fecha de Nacimiento" type="date" InputLabelProps={{ shrink: true }} value={field.value || ''} disabled /> )} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Domicilio" {...register("domicilio")} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Celular" type="tel" {...register("celular")} />
                            </Grid>
                            <Grid item xs={12}>
                                <Controller name="paisDeNacimiento" control={control} render={({ field }) => ( <Autocomplete options={countryOptions} {...field} onChange={(e, val) => field.onChange(val)} ListboxProps={{ style: { maxHeight: '200px' } }} renderInput={(params) => <TextField {...params} fullWidth label="País de Nacimiento" InputLabelProps={{ shrink: true }} sx={{ minWidth: 300 }} />} /> )} />
                            </Grid>
                            <Grid item xs={12}>
                                <Controller name="ciudadDeNacimiento" control={control} render={({ field }) => ( <Autocomplete options={cityOptions} {...field} onChange={(e, val) => field.onChange(val)} disabled={!selectedCountryName || cityOptions.length === 0} ListboxProps={{ style: { maxHeight: '200px' } }} renderInput={(params) => <TextField {...params} fullWidth label="Ciudad/Departamento" InputLabelProps={{ shrink: true }} sx={{ minWidth: 300 }} />} /> )} />
                            </Grid>
                        </Grid>
                    </TabPanel>

                    {serverError && ( <Box sx={{ p: 2, pb: 0 }}> <Alert severity="error" onClose={() => setServerError(null)}> {serverError} </Alert> </Box> )}
                    
                    {tabValue !== 2 && (
                        <Box sx={{ p: 3, pt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button type="submit" variant="contained" disabled={isSubmitting || !isDirty}>
                                {isSubmitting ? <CircularProgress size={24} /> : 'Guardar Cambios'}
                            </Button>
                        </Box>
                    )}
                </form>

                {/* El panel de seguridad se renderiza fuera del formulario principal */}
                <TabPanel value={tabValue} index={2}>
                    <ChangePasswordForm />
                </TabPanel>

                <Snackbar open={openSnackbar} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                    <Alert onClose={() => setOpenSnackbar(false)} severity="success" sx={{ width: '100%' }}>
                        {successMessage}
                    </Alert>
                </Snackbar>
            </Paper>
        </Container>
    );
};

export default EditProfilePage;