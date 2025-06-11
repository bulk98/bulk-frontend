// src/pages/CreatePostPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link as RouterLink, useLocation } from 'react-router-dom'; //
import { useAuth } from '../contexts/AuthContext'; //
import { getCommunityDetails } from '../services/communityService'; //
import { createPost } from '../services/postService'; //

// Importaciones de Material-UI
import Container from '@mui/material/Container'; //
import Typography from '@mui/material/Typography'; //
import Paper from '@mui/material/Paper'; //
import Box from '@mui/material/Box'; //
import TextField from '@mui/material/TextField'; //
import Button from '@mui/material/Button'; //
import CircularProgress from '@mui/material/CircularProgress'; //
import Alert from '@mui/material/Alert'; //
import FormControlLabel from '@mui/material/FormControlLabel'; //
import Switch from '@mui/material/Switch'; //
import IconButton from '@mui/material/IconButton'; //
import PhotoCamera from '@mui/icons-material/PhotoCamera'; //
import Chip from '@mui/material/Chip'; //
import Avatar from '@mui/material/Avatar'; // Para el ícono
import PostAddIcon from '@mui/icons-material/PostAdd'; // Ícono para crear post

const CreatePostPage = () => {
    const { communityId } = useParams(); //
    const navigate = useNavigate(); //
    const { user: authUser, isAuthenticated } = useAuth(); //
    const location = useLocation(); //

    const routeState = location.state || {}; //
    const communityNameFromState = routeState.communityName; //
     const canUserMarkAsPremium = routeState.canUserMarkAsPremium !== undefined 
        ? routeState.canUserMarkAsPremium 
        : (authUser?.tipo_usuario === 'OG'); //

    const [communityName, setCommunityName] = useState(communityNameFromState || ''); //
    const [loadingCommunityInfo, setLoadingCommunityInfo] = useState(!communityNameFromState); //

    const [title, setTitle] = useState(''); //
    const [content, setContent] = useState(''); //
    const [isPremium, setIsPremium] = useState(false); //
    const [imageFile, setImageFile] = useState(null); //
    const [imagePreview, setImagePreview] = useState(null); //
    const fileInputRef = useRef(null); //

    const [loading, setLoading] = useState(false); //
    const [error, setError] = useState(''); //
    const [successMessage, setSuccessMessage] = useState(''); //

    useEffect(() => { //
        if (!isAuthenticated) {
            navigate('/login', { state: { from: `/comunidades/${communityId}/crear-post` } });
            return;
        }
        if (!communityNameFromState) {
            const fetchCommunityName = async () => {
                setLoadingCommunityInfo(true);
                try {
                    const communityData = await getCommunityDetails(communityId); //
                    setCommunityName(communityData.name);
                } catch (err) {
                    console.error("Error fetching community details for CreatePostPage:", err);
                    setError("No se pudo cargar la información de la comunidad.");
                } finally {
                    setLoadingCommunityInfo(false);
                }
            };
            fetchCommunityName();
        }
    }, [communityId, isAuthenticated, navigate, communityNameFromState]);

    const handleImageChange = (event) => { //
        const file = event.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => { setImagePreview(reader.result); };
            reader.readAsDataURL(file);
        } else {
            setImageFile(null); setImagePreview(null);
        }
    };

    const handleSubmit = async (event) => { //
        event.preventDefault();
        setError(''); setSuccessMessage('');
        if (!title.trim() || !content.trim()) { setError('El título y el contenido son obligatorios.'); return; }
        setLoading(true);
        const postData = { title: title.trim(), content: content.trim() };
        if (canUserMarkAsPremium) { postData.esPremium = isPremium; } 
        else { postData.esPremium = false; }
        
        try {
            const newPost = await createPost(communityId, postData, imageFile); //
            setSuccessMessage(`Post "${newPost.title}" creado exitosamente. Redirigiendo...`);
            setTitle(''); setContent(''); setIsPremium(false); 
            setImageFile(null); setImagePreview(null);
            if(fileInputRef.current) fileInputRef.current.value = "";
            setTimeout(() => { navigate(`/posts/${newPost.id}`); }, 2000);
        } catch (err) {
            console.error("Error al crear el post:", err);
            let errorMessage = "Error al crear el post.";
            if (err.errors && Array.isArray(err.errors)) { errorMessage = err.errors.map(e => e.msg).join(' '); } 
            else if (err.message) { errorMessage = err.message; }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };
    
    if (loadingCommunityInfo && !communityName) { //
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
    }

    return (
        <Container 
            maxWidth="md" // Mantenemos "md" para más espacio en este formulario
            sx={{ 
                mt: { xs: 4, sm: 6 }, 
                mb: 4 
            }}
        >
            <Paper 
                elevation={3} // O usar default del tema
                sx={{ 
                    p: {xs: 2, sm: 3, md: 4}, 
                    borderRadius: (theme) => theme.shape.borderRadius * 1.5,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 56, height: 56 }}>
                    <PostAddIcon fontSize="medium"/>
                </Avatar>
                <Typography variant="h4" component="h1" sx={{ mt:1, textAlign: 'center' }}>
                    Crear Nuevo Post
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
                    en "{communityName || 'esta comunidad'}" {/* */}
                </Typography>
                
                <Box 
                    component="form" 
                    onSubmit={handleSubmit} 
                    noValidate 
                    sx={{ 
                        width: '100%', 
                        maxWidth: '700px', // Ancho máximo para el formulario
                        mt: successMessage || error ? 1 : 2
                    }}
                >
                    {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
                    {successMessage && <Alert severity="success" sx={{ width: '100%', mb: 2 }}>{successMessage}</Alert>}

                    <TextField
                        label="Título del Post"
                        fullWidth
                        margin="normal"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        disabled={loading || !!successMessage}
                        inputProps={{ maxLength: 150 }} //
                    />
                    <TextField
                        label="Contenido del Post"
                        fullWidth
                        margin="normal"
                        multiline
                        rows={10} //
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                        disabled={loading || !!successMessage}
                    />

                    {/* Sección de Carga de Imagen */}
                    <Box sx={{ my: 2.5, p:2, border: (theme) => `1px dashed ${theme.palette.divider}`, borderRadius: 1, textAlign:'center' }}>
                        <Typography variant="subtitle2" gutterBottom color="text.secondary">Imagen del Post (Opcional)</Typography>
                        <Button
                            variant="outlined"
                            component="label" // Permite que el input file se active con el botón
                            startIcon={<PhotoCamera />}
                            disabled={loading || !!successMessage}
                            sx={{mb: imagePreview ? 1 : 0}}
                        >
                            Seleccionar Imagen
                            <input type="file" hidden accept="image/jpeg, image/png, image/gif, image/webp" onChange={handleImageChange} ref={fileInputRef} />
                        </Button>
                        {imagePreview && ( //
                            <Box sx={{ mt: 2, textAlign: 'center' }}>
                                <Box
                                    component="img"
                                    src={imagePreview}
                                    alt="Vista previa"
                                    sx={{ maxHeight: '250px', maxWidth: '100%', borderRadius: 1, border: (theme) => `1px solid ${theme.palette.divider}` }}
                                />
                                <Button size="small" onClick={() => {setImageFile(null); setImagePreview(null); if(fileInputRef.current) fileInputRef.current.value = "";}} sx={{display:'block', mx:'auto', mt:1.5}} disabled={loading || !!successMessage}>
                                    Quitar Imagen
                                </Button>
                            </Box>
                        )}
                         {!imagePreview && imageFile && <Chip label={imageFile.name} onDelete={() => {setImageFile(null); if(fileInputRef.current) fileInputRef.current.value = "";}} sx={{mt:1.5}} />}
                    </Box>

                    {/* Switch para 'esPremium' */}
                    {canUserMarkAsPremium && ( //
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={isPremium}
                                    onChange={(e) => setIsPremium(e.target.checked)}
                                    disabled={loading || !!successMessage}
                                    color="primary"
                                />
                            }
                            label="Marcar como Post Premium (Solo para suscriptores)"
                            sx={{ my: 1.5, display: 'block' }}
                        />
                    )}
                    
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
                        <Button 
                            component={RouterLink} 
                            to={`/comunidades/${communityId}`} //
                            disabled={loading || !!successMessage}
                            variant="outlined"
                            color="inherit"
                        >
                            Cancelar
                        </Button>
                        <Button 
                            type="submit" 
                            variant="contained" 
                            color="primary" 
                            disabled={loading || !!successMessage}
                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                            sx={{ py: 1.2 }}
                        >
                            {loading ? 'Creando Post...' : 'Crear Post'}
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default CreatePostPage;