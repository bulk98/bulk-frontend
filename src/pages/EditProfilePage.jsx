// src/pages/EditProfilePage.jsx
import React, { useState, useEffect } from 'react';
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
    
    const [formData, setFormData] = useState({
        name: '', username: '', email: '',
        paisDeNacimiento: '', ciudadDeNacimiento: '',
        domicilio: '', celular: '',
    });
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            if (loadingAuth || !authUser) return;
            setLoading(true);
            try {
                const profileData = await getUserProfile();
                setFormData({
                    name: profileData.name || '',
                    username: profileData.username || '',
                    email: profileData.email || '',
                    paisDeNacimiento: profileData.paisDeNacimiento || '',
                    ciudadDeNacimiento: profileData.ciudadDeNacimiento || '',
                    domicilio: profileData.domicilio || '',
                    celular: profileData.celular || '',
                });

                if (profileData.paisDeNacimiento) {
                    const countryData = countries.find(c => c.name === profileData.paisDeNacimiento);
                    if (countryData) {
                        setCities(countryData.states);
                    }
                }
            } catch (err) {
                setError('No se pudo cargar tu información de perfil.');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [loadingAuth, authUser]);

    useEffect(() => {
        if (formData.paisDeNacimiento) {
            const countryData = countries.find(c => c.name === formData.paisDeNacimiento);
            setCities(countryData ? countryData.states : []);
        } else {
            setCities([]);
        }
    }, [formData.paisDeNacimiento]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'paisDeNacimiento') {
            setFormData({
                ...formData,
                paisDeNacimiento: value,
                ciudadDeNacimiento: '', 
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccessMessage('');
        try {
            const { email, ...dataToUpdate } = formData;
            const updatedProfile = await updateUserProfile(dataToUpdate);
            updateAuthUser(updatedProfile);
            setSuccessMessage('¡Tu perfil ha sido actualizado con éxito!');
        } catch (err) {
            setError(err.message || 'Ocurrió un error al guardar tu perfil.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
    }

    return (
        <Container maxWidth="md">
            <Paper sx={{ p: { xs: 2, sm: 4 }, mt: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Editar Mi Perfil
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 4 }}>
                    Aquí puedes actualizar tu información personal y de contacto.
                </Typography>
                <Box component="form" onSubmit={handleSubmit}>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}
                    
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField required fullWidth id="name" name="name" label="Nombre y Apellidos" value={formData.name} onChange={handleChange} disabled={saving}/>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField required fullWidth id="username" name="username" label="@usuario" value={formData.username} onChange={handleChange} disabled={saving}/>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField required fullWidth id="email" name="email" label="Correo Electrónico" value={formData.email} disabled helperText="El correo electrónico no se puede modificar."/>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth variant="outlined" disabled={saving}>
                                <InputLabel id="pais-label">País</InputLabel>
                                <Select
                                    labelId="pais-label"
                                    id="paisDeNacimiento"
                                    name="paisDeNacimiento"
                                    value={formData.paisDeNacimiento}
                                    onChange={handleChange}
                                    label="País"
                                    // === CORRECCIÓN DE LAYOUT ===
                                    sx={{ minWidth: 120 }}
                                >
                                    <MenuItem value=""><em>Selecciona un país</em></MenuItem>
                                    {countries.map((country) => (
                                        <MenuItem key={country.name} value={country.name}>{country.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth variant="outlined" disabled={saving || !formData.paisDeNacimiento}>
                                <InputLabel id="ciudad-label">Ciudad / Estado</InputLabel>
                                <Select
                                    labelId="ciudad-label"
                                    id="ciudadDeNacimiento"
                                    name="ciudadDeNacimiento"
                                    value={formData.ciudadDeNacimiento}
                                    onChange={handleChange}
                                    label="Ciudad / Estado"
                                    // === CORRECCIÓN DE LAYOUT ===
                                    sx={{ minWidth: 120 }}
                                >
                                    <MenuItem value=""><em>Selecciona una opción</em></MenuItem>
                                    {cities.map((city) => (
                                        <MenuItem key={city} value={city}>{city}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth id="domicilio" name="domicilio" label="Domicilio (Opcional)" value={formData.domicilio} onChange={handleChange} disabled={saving}/>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth id="celular" name="celular" label="Teléfono / Celular (Opcional)" value={formData.celular} onChange={handleChange} disabled={saving}/>
                        </Grid>
                    </Grid>
                    <Stack direction="row" justifyContent="flex-end" sx={{ mt: 4 }}>
                        <Button type="submit" variant="contained" disabled={saving} startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}>
                            {saving ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </Stack>
                </Box>
            </Paper>
        </Container>
    );
};

export default EditProfilePage;