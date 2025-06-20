// RUTA: src/pages/CreatePostPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { getCommunityDetails } from '../services/communityService';
import { createPost } from '../services/postService';
import {
  Container, Typography, Paper, Box, TextField, Button, CircularProgress, Alert,
  FormControlLabel, Switch, Avatar
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import PostAddIcon from '@mui/icons-material/PostAdd';

const CreatePostPage = () => {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState('');
  const [imagePreview, setImagePreview] = useState(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      title: '',
      content: '',
      esPremium: false,
      postImage: null
    }
  });

  useEffect(() => {
    // Asegura que el campo esPremium esté definido y registrado
    setValue('esPremium', false);
  }, [setValue]);

  const imageFile = watch('postImage');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    getCommunityDetails(communityId)
      .then(data => setCommunity(data))
      .catch(err => setServerError("No se pudo cargar la información de la comunidad."))
      .finally(() => setLoading(false));
  }, [communityId, isAuthenticated, navigate]);

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

  const onSubmit = async (data) => {
    setServerError('');
    console.log("🟡 Datos recibidos en onSubmit:", data); // 👈 Verifica que esPremium esté presente

    try {
      const postDataPayload = {
        title: data.title,
        content: data.content,
        esPremium: data.esPremium,
        postImage: data.postImage?.[0]
      };
      const newPost = await createPost(communityId, postDataPayload);
      navigate(`/posts/${newPost.id}`);
    } catch (err) {
      setServerError(err.message || "Error al crear el post.");
    }
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
      <CircularProgress />
    </Box>
  );

  const canUserMarkAsPremium = community?.currentUserMembership?.role === 'CREATOR' ||
    (community?.currentUserMembership?.role === 'MODERATOR' && community.currentUserMembership.canPublishPremiumContent);

  return (
    <Container maxWidth="md" sx={{ mt: { xs: 4, sm: 6 }, mb: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 }, borderRadius: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}><PostAddIcon /></Avatar>
        <Typography variant="h4" component="h1">Crear Nuevo Post</Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>en "{community?.name}"</Typography>

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ width: '100%', maxWidth: '700px', mt: 1 }}>
          {serverError && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{serverError}</Alert>}

          <TextField
            label="Título"
            fullWidth
            margin="normal"
            {...register("title", { required: 'El título es obligatorio' })}
            error={!!errors.title}
            helperText={errors.title?.message}
            disabled={isSubmitting}
          />

          <TextField
            label="Contenido"
            fullWidth
            margin="normal"
            multiline
            rows={10}
            {...register("content", { required: 'El contenido es obligatorio' })}
            error={!!errors.content}
            helperText={errors.content?.message}
            disabled={isSubmitting}
          />

          <Box sx={{ my: 2.5, p: 2, border: 1, borderColor: 'divider', borderRadius: 1, textAlign: 'center' }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<PhotoCamera />}
              disabled={isSubmitting}
            >
              Subir Imagen
              <input type="file" hidden accept="image/*" {...register("postImage")} />
            </Button>
            {imagePreview && (
              <Box sx={{ mt: 2 }}>
                <Box
                  component="img"
                  src={imagePreview}
                  alt="Vista previa"
                  sx={{ maxHeight: '250px', maxWidth: '100%', borderRadius: 1 }}
                />
              </Box>
            )}
          </Box>

          {/* ===== INICIO DEL BLOQUE CORREGIDO PARA esPremium ===== */}
          {canUserMarkAsPremium && (
            <Controller
              name="esPremium"
              control={control}
              defaultValue={false}
              render={({ field: { value, onChange, ref } }) => (
                <FormControlLabel
                  control={
                    <Switch
                      inputRef={ref}
                      checked={!!value}
                      onChange={(e) => onChange(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Marcar como Post Premium"
                  sx={{ my: 1.5, display: 'block' }}
                  disabled={isSubmitting}
                />
              )}
            />
          )}
          {/* ===== FIN DEL BLOQUE CORREGIDO PARA esPremium ===== */}

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
            <Button component={RouterLink} to={`/comunidades/${communityId}`} disabled={isSubmitting} variant="outlined">
              Cancelar
            </Button>
            <Button type="submit" variant="contained" disabled={isSubmitting} startIcon={isSubmitting ? <CircularProgress size={20} /> : null}>
              {isSubmitting ? 'Publicando...' : 'Crear Post'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreatePostPage;
