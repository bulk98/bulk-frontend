// src/pages/CreateCommunityPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { createCommunity } from '../services/communityService';
import { 
    Container, Typography, Paper, Box, TextField, Button, CircularProgress, Alert, 
    FormControlLabel, Switch, Select, MenuItem, InputLabel, FormControl, Grid, Avatar 
} from '@mui/material';
import GroupAddIcon from '@mui/icons-material/GroupAdd';

const categories = ["Deportiva", "Apuestas", "Educativa", "Entretenimiento", "Tecnología", "Arte y Cultura", "Estilo de Vida", "Otro"];
const languages = ["Español", "Inglés", "Portugués", "Francés", "Alemán", "Italiano", "Chino", "Japonés"];

const CreateCommunityPage = () => {
    const navigate = useNavigate();
    
    const [serverError, setServerError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const {
        register,
        handleSubmit,
        control,
        watch,
        formState: { errors, isSubmitting }
    } = useForm({
        defaultValues: {
            name: '',
            description: '',
            esPublica: true,
            categoria: '',
            otherCategory: '',
            idiomaPrincipal: '',
            idiomaSecundario: ''
        }
    });

    const categoriaSeleccionada = watch("categoria");
    const idiomaPrincipalSeleccionado = watch("idiomaPrincipal");

    const onSubmit = async (data) => {
        setServerError('');
        setSuccessMessage('');

        const finalCategory = data.categoria === 'Otro' ? data.otherCategory.trim() : data.categoria;
        if (data.categoria === 'Otro' && !finalCategory) {
            setServerError('Si eliges "Otro", debes especificar la categoría.');
            return;
        }

        try {
            const communityData = { 
                name: data.name.trim(), 
                description: data.description.trim(), 
                esPublica: data.esPublica, 
                categoria: finalCategory,
                idiomaPrincipal: data.idiomaPrincipal,
                idiomaSecundario: data.idiomaSecundario || null,
            };
            const response = await createCommunity(communityData);
            setSuccessMessage(response.mensaje || `Comunidad creada con éxito. Redirigiendo...`);
            setTimeout(() => { navigate(`/comunidades/${response.comunidad.id}`); }, 2500);
        } catch (err) {
            setServerError(err.message || 'Error al crear la comunidad.');
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 6, mb: 4 }}>
            <Paper elevation={3} sx={{ p: {xs: 2, sm: 4}, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 2 }}>
                <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}><GroupAddIcon /></Avatar>
                <Typography variant="h4" component="h1">Crear Nueva Comunidad</Typography>
                
                <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ width: '100%', maxWidth: '600px', mt: 3 }}>
                    {serverError && <Alert severity="error" sx={{ mb: 2 }}>{serverError}</Alert>}
                    {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

                    <TextField fullWidth margin="normal" label="Nombre de la Comunidad" {...register("name", { required: "El nombre es obligatorio" })} error={!!errors.name} helperText={errors.name?.message} disabled={isSubmitting || !!successMessage} autoFocus />
                    <TextField fullWidth margin="normal" label="Descripción (Opcional)" multiline rows={4} {...register("description")} disabled={isSubmitting || !!successMessage} />
                    
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={categoriaSeleccionada === 'Otro' ? 6 : 12}>
                             <FormControl fullWidth margin="normal" required error={!!errors.categoria}>
                                <InputLabel>Categoría</InputLabel>
                                <Controller
                                    name="categoria"
                                    control={control}
                                    rules={{ required: "Debes seleccionar una categoría" }}
                                    render={({ field }) => (
                                        <Select label="Categoría" {...field} disabled={isSubmitting || !!successMessage} sx={{ minWidth: 120 }}>
                                            {categories.map((cat) => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
                                        </Select>
                                    )}
                                />
                                {errors.categoria && <Typography color="error" variant="caption" sx={{ml:2}}>{errors.categoria.message}</Typography>}
                            </FormControl>
                        </Grid>
                        {categoriaSeleccionada === 'Otro' && (
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth margin="normal" label="Especifica la categoría" {...register("otherCategory", { required: "Este campo es obligatorio"})} error={!!errors.otherCategory} helperText={errors.otherCategory?.message} disabled={isSubmitting || !!successMessage} />
                            </Grid>
                        )}
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth margin="normal" required error={!!errors.idiomaPrincipal}>
                                <InputLabel>Idioma Principal</InputLabel>
                                <Controller
                                    name="idiomaPrincipal"
                                    control={control}
                                    rules={{ required: "El idioma principal es obligatorio" }}
                                    render={({ field }) => (
                                        <Select label="Idioma Principal" {...field} disabled={isSubmitting || !!successMessage} sx={{ minWidth: 120 }}>
                                            {languages.map((lang) => <MenuItem key={lang} value={lang}>{lang}</MenuItem>)}
                                        </Select>
                                    )}
                                />
                                {errors.idiomaPrincipal && <Typography color="error" variant="caption" sx={{ml:2}}>{errors.idiomaPrincipal.message}</Typography>}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                           <FormControl fullWidth margin="normal" disabled={isSubmitting || !!successMessage || !idiomaPrincipalSeleccionado}>
                                <InputLabel>Idioma Secundario (Opcional)</InputLabel>
                                <Controller
                                    name="idiomaSecundario"
                                    control={control}
                                    render={({ field }) => (
                                        <Select label="Idioma Secundario (Opcional)" {...field} sx={{ minWidth: 120 }}>
                                            <MenuItem value=""><em>Ninguno</em></MenuItem>
                                            {languages.filter(l => l !== idiomaPrincipalSeleccionado).map((lang) => <MenuItem key={lang} value={lang}>{lang}</MenuItem>)}
                                        </Select>
                                    )}
                                />
                            </FormControl>
                        </Grid>
                    </Grid>

                    <FormControlLabel control={
                        <Controller name="esPublica" control={control} render={({ field }) => <Switch {...field} checked={field.value} />} />
                    } label="Pública (Visible para todos)" sx={{ my: 1.5, display: 'block' }} disabled={isSubmitting || !!successMessage} />
                    
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
                        <Button component={RouterLink} to="/dashboard" disabled={isSubmitting || !!successMessage} variant="outlined">Cancelar</Button>
                        <Button type="submit" variant="contained" disabled={isSubmitting || !!successMessage}>
                            {isSubmitting ? <CircularProgress size={24}/> : 'Crear Comunidad'}
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};
export default CreateCommunityPage;