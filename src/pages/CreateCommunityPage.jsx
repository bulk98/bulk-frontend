// src/pages/CreateCommunityPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { createCommunity } from '../services/communityService';
import { 
    Container, Typography, Paper, Box, TextField, Button, CircularProgress, Alert, 
    FormControlLabel, Switch, Select, MenuItem, InputLabel, FormControl, Grid, Avatar 
} from '@mui/material';
import GroupAddIcon from '@mui/icons-material/GroupAdd';

// Listas de opciones
const categories = ["Deportiva", "Apuestas", "Educativa", "Entretenimiento", "Tecnología", "Arte y Cultura", "Estilo de Vida", "Otro"];
const languages = ["Español", "Inglés", "Portugués", "Francés", "Alemán", "Italiano", "Chino", "Japonés"];

const CreateCommunityPage = () => {
    const navigate = useNavigate();
    
    // Estados del formulario
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    const [category, setCategory] = useState('');
    const [otherCategory, setOtherCategory] = useState('');
    // === NUEVOS ESTADOS PARA IDIOMAS ===
    const [idiomaPrincipal, setIdiomaPrincipal] = useState('');
    const [idiomaSecundario, setIdiomaSecundario] = useState('');
    
    // Estados de control
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        if (!name.trim() || !category || !idiomaPrincipal) { 
            setError('El nombre, la categoría y el idioma principal son obligatorios.'); 
            return; 
        }
        
        const finalCategory = category === 'Otro' ? otherCategory.trim() : category;
        if (category === 'Otro' && !finalCategory) {
            setError('Si eliges "Otro", debes especificar la categoría.');
            return;
        }

        setLoading(true);
        try {
            const communityData = { 
                name: name.trim(), 
                description: description.trim(), 
                esPublica: isPublic, 
                categoria: finalCategory,
                // === NUEVOS CAMPOS ENVIADOS AL BACKEND ===
                idiomaPrincipal: idiomaPrincipal,
                idiomaSecundario: idiomaSecundario || null,
            };
            const response = await createCommunity(communityData);
            setSuccessMessage(response.mensaje || `Comunidad creada con éxito. Redirigiendo...`);
            setTimeout(() => { navigate(`/comunidades/${response.comunidad.id}`); }, 2500);
        } catch (err) {
            setError(err.message || 'Error al crear la comunidad.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 6, mb: 4 }}>
            <Paper elevation={3} sx={{ p: {xs: 2, sm: 4}, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 2 }}>
                <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 56, height: 56 }}>
                    <GroupAddIcon />
                </Avatar>
                <Typography variant="h4" component="h1">
                    Crear Nueva Comunidad
                </Typography>
                
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%', maxWidth: '600px', mt: 3 }}>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

                    <TextField label="Nombre de la Comunidad" fullWidth margin="normal" value={name} onChange={(e) => setName(e.target.value)} required disabled={loading || !!successMessage} autoFocus/>
                    <TextField label="Descripción (Opcional)" fullWidth margin="normal" multiline rows={4} value={description} onChange={(e) => setDescription(e.target.value)} disabled={loading || !!successMessage} />
                    
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={category === 'Otro' ? 6 : 12}>
                             <FormControl fullWidth margin="normal" required disabled={loading || !!successMessage}>
                                <InputLabel>Categoría</InputLabel>
                                <Select value={category} label="Categoría" onChange={(e) => setCategory(e.target.value)}>
                                    {categories.map((cat) => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        {category === 'Otro' && (
                            <Grid item xs={12} sm={6}>
                                <TextField label="Especifica la categoría" fullWidth margin="normal" value={otherCategory} onChange={(e) => setOtherCategory(e.target.value)} required disabled={loading || !!successMessage} />
                            </Grid>
                        )}
                    </Grid>

                    {/* === INICIO DE LA CORRECCIÓN CON FLEXBOX === */}
                    <Box sx={{ display: 'flex', gap: 2, mt: 2, mb: 1 }}>
                        <FormControl fullWidth required disabled={loading || !!successMessage}>
                            <InputLabel>Idioma Principal</InputLabel>
                            <Select value={idiomaPrincipal} label="Idioma Principal" onChange={(e) => setIdiomaPrincipal(e.target.value)}>
                                {languages.map((lang) => <MenuItem key={lang} value={lang}>{lang}</MenuItem>)}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth disabled={loading || !!successMessage || !idiomaPrincipal}>
                            <InputLabel>Idioma Secundario (Opcional)</InputLabel>
                            <Select value={idiomaSecundario} label="Idioma Secundario (Opcional)" onChange={(e) => setIdiomaSecundario(e.target.value)}>
                                <MenuItem value=""><em>Ninguno</em></MenuItem>
                                {languages.filter(l => l !== idiomaPrincipal).map((lang) => <MenuItem key={lang} value={lang}>{lang}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Box>

                    <FormControlLabel control={<Switch checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} disabled={loading || !!successMessage} />} label={isPublic ? "Pública (Visible para todos)" : "Privada (Solo para miembros)"} sx={{ my: 1.5, display: 'block' }} />
                    
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
                        <Button component={RouterLink} to="/dashboard" disabled={loading || !!successMessage} variant="outlined">Cancelar</Button>
                        <Button type="submit" variant="contained" disabled={loading || !!successMessage}>{loading ? <CircularProgress size={24}/> : 'Crear Comunidad'}</Button>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};
export default CreateCommunityPage;