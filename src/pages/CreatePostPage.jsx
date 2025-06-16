// src/pages/CreatePostPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { getCommunityDetails } from '../services/communityService';
import { createPost } from '../services/postService';
import {
    Container, Typography, Paper, Box, TextField, Button, CircularProgress, Alert,
    FormControlLabel, Switch, IconButton, Avatar
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import PostAddIcon from '@mui/icons-material/PostAdd';

const CreatePostPage = () => {
    const { communityId } = useParams();
    const navigate = useNavigate();
    const { user: authUser, isAuthenticated } = useAuth();
    const location = useLocation();

    const [communityName, setCommunityName] = useState(location.state?.communityName || '');
    const [loadingCommunityInfo, setLoadingCommunityInfo] = useState(!location.state?.communityName);
    const [imagePreview, setImagePreview] = useState(null);
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
            title: '',
            content: '',
            esPremium: false,
            postImage: null
        }
    });

    const imageFile = watch('postImage');

    useEffect(() => {
        if (imageFile && imageFile.length > 0) {
            const file = imageFile[0];
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        } else {
            setImagePreview(null);
        }
    }, [imageFile]);

    useEffect(() => {
        if (!isAuthenticated) navigate('/login');
        if (!communityName) {
            setLoadingCommunityInfo(true);
            getCommunityDetails(communityId)
                .then(data => setCommunityName(data.name))
                .catch(err => setServerError("No se pudo cargar la información de la comunidad."))
                .finally(() => setLoadingCommunityInfo(false));
        }
    }, [communityId, isAuthenticated, navigate, communityName]);

    const onSubmit = async (data) => {
        setServerError('');
        setSuccessMessage('');
        try {
            const imageFileToSend = data.postImage ? data.postImage[0] : null;
            // Pasamos el objeto 'data' completo al servicio, que contiene el valor booleano de esPremium
            const newPost = await createPost(communityId, data, imageFileToSend);
            setSuccessMessage(`Post "${newPost.title}" creado exitosamente. Redirigiendo...`);
            setTimeout(() => { navigate(`/posts/${newPost.id}`); }, 2000);
        } catch (err) {
            setServerError(err.message || "Error al crear el post.");
        }
    };
    
    if (loadingCommunityInfo) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;

    const canUserMarkAsPremium = location.state?.canUserMarkAsPremium ?? (authUser?.tipo_usuario === 'OG');

    return (
        <Container maxWidth="md" sx={{ mt: { xs: 4, sm: 6 }, mb: 4 }}>
            <Paper elevation={3} sx={{ p: {xs: 2, sm: 3, md: 4}, borderRadius: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}><PostAddIcon/></Avatar>
                <Typography variant="h4" component="h1">Crear Nuevo Post</Typography>
                <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>en "{communityName}"</Typography>
                
                <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ width: '100%', maxWidth: '700px', mt: 1 }}>
                    {serverError && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{serverError}</Alert>}
                    {successMessage && <Alert severity="success" sx={{ width: '100%', mb: 2 }}>{successMessage}</Alert>}
                    <TextField label="Título del Post" fullWidth margin="normal" {...register("title", { required: 'El título es obligatorio' })} error={!!errors.title} helperText={errors.title?.message} disabled={isSubmitting || !!successMessage} />
                    <TextField label="Contenido del Post" fullWidth margin="normal" multiline rows={10} {...register("content", { required: 'El contenido es obligatorio' })} error={!!errors.content} helperText={errors.content?.message} disabled={isSubmitting || !!successMessage} />
                    <Box sx={{ my: 2.5, p:2, border: 1, borderColor: 'divider', borderRadius: 1, textAlign:'center' }}>
                        <Button variant="outlined" component="label" startIcon={<PhotoCamera />} disabled={isSubmitting || !!successMessage}>
                            Seleccionar Imagen
                            <input type="file" hidden accept="image/*" {...register("postImage")} />
                        </Button>
                        {imagePreview && <Box sx={{ mt: 2 }}><Box component="img" src={imagePreview} alt="Vista previa" sx={{ maxHeight: '250px', maxWidth: '100%', borderRadius: 1 }}/></Box>}
                    </Box>
                    {canUserMarkAsPremium && (
                        <FormControlLabel control={<Controller name="esPremium" control={control} render={({ field }) => <Switch {...field} checked={field.value} />} />} label="Marcar como Post Premium" sx={{ my: 1.5, display: 'block' }} disabled={isSubmitting || !!successMessage}/>
                    )}
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
                        <Button component={RouterLink} to={`/comunidades/${communityId}`} disabled={isSubmitting || !!successMessage} variant="outlined">Cancelar</Button>
                        <Button type="submit" variant="contained" disabled={isSubmitting || !!successMessage} startIcon={isSubmitting ? <CircularProgress size={20}/> : null}>{isSubmitting ? 'Publicando...' : 'Crear Post'}</Button>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};
export default CreatePostPage;