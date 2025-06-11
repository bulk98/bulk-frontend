import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { getPostById, toggleLikePost } from '../services/postService';
import { useAuth } from '../contexts/AuthContext';
import CommentSection from '../components/comments/CommentSection';

// Importaciones de MUI
import { Container, Typography, Paper, Box, CircularProgress, Alert, Button, Divider, Avatar, Link, IconButton, CardMedia, Tooltip, Stack, Chip, Dialog } from '@mui/material';

// Iconos
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import CloseIcon from '@mui/icons-material/Close';

const PostDetailPage = () => {
    const { postId } = useParams();
    const { isAuthenticated } = useAuth();
    
    const [post, setPost] = useState(null);
    const [loadingPost, setLoadingPost] = useState(true);
    const [errorPost, setErrorPost] = useState(null);
    
    const [isLikedByCurrentUser, setIsLikedByCurrentUser] = useState(false);
    const [currentLikesCount, setCurrentLikesCount] = useState(0);
    const [likeActionLoading, setLikeActionLoading] = useState(false);

    const [lightboxOpen, setLightboxOpen] = useState(false);

    useEffect(() => {
        const fetchPostDetails = async () => {
            if (!postId) {
                setErrorPost('No se especificó un ID de post.');
                setLoadingPost(false);
                return;
            }
            setLoadingPost(true);
            try {
                const data = await getPostById(postId);
                setPost(data);
                setCurrentLikesCount(data.likesCount || 0);
                setIsLikedByCurrentUser(data.userHasLiked || false);
            } catch (err) {
                setErrorPost(err.message || 'Error al cargar el post.');
            } finally {
                setLoadingPost(false);
            }
        };
        fetchPostDetails();
    }, [postId]);

    const handleToggleLike = useCallback(async () => {
        if (!isAuthenticated) return;
        setLikeActionLoading(true);
        try {
            const response = await toggleLikePost(postId);
            setIsLikedByCurrentUser(response.reacted);
            if (response.newTotalLikes !== undefined) {
                setCurrentLikesCount(response.newTotalLikes);
            }
        } catch (err) {
            console.error("Error al dar like/unlike:", err);
        } finally {
            setLikeActionLoading(false);
        }
    }, [isAuthenticated, postId]);

    const handleOpenLightbox = () => setLightboxOpen(true);
    const handleCloseLightbox = () => setLightboxOpen(false);


    if (loadingPost) { return <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>; }
    if (errorPost) { return <Container maxWidth="md" sx={{ mt: 4 }}><Alert severity="error">{errorPost}</Alert></Container>; }
    if (!post) { return <Container maxWidth="md" sx={{ mt: 4 }}><Alert severity="warning">Post no encontrado.</Alert></Container>; }

    const { title, content: postContent, author, community, createdAt, esPremium, imageUrl } = post;

    return (
        <>
            <Container maxWidth="md" sx={{ mt: { xs: 2, sm: 4 }, mb: 4 }}>
                <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 }, borderRadius: 2 }}>
                    <Stack spacing={2} sx={{ mb: 3 }}>
                        {esPremium && <Chip label="Contenido Premium" color="premium" sx={{ alignSelf: 'flex-start' }} />}
                        <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>{title}</Typography>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar src={author?.avatarUrl} />
                            <Box>
                                <Link component={RouterLink} to={`/perfil/${author?.id}`} underline="hover" color="text.primary">
                                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                        {author?.name || author?.email}
                                    </Typography>
                                </Link>
                                <Typography variant="body2" color="text.secondary">
                                    En <Link component={RouterLink} to={`/comunidades/${community?.id}`} sx={{ fontWeight: 'medium' }}>{community?.name}</Link>
                                    {' • '}
                                    <Tooltip title={new Date(createdAt).toLocaleString()}>
                                        <span>{new Date(createdAt).toLocaleDateString('es-ES', { month: 'long', day: 'numeric' })}</span>
                                    </Tooltip>
                                </Typography>
                            </Box>
                        </Stack>
                    </Stack>

                    {imageUrl && (
                        <CardMedia component="img" image={imageUrl} alt={`Imagen para ${title}`} onClick={handleOpenLightbox}
                            sx={{ width: '100%', borderRadius: 1.5, mb: 3, maxHeight: 500, objectFit: 'cover', cursor: 'pointer' }}
                        />
                    )}

                    <Box sx={{ mb: 4, fontSize: '1.1rem', lineHeight: 1.8 }}>
                        <Typography variant="body1" component="div" sx={{ whiteSpace: 'pre-wrap' }}>{postContent}</Typography>
                    </Box>

                    <Divider />
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ py: 2 }}>
                         <Button onClick={handleToggleLike} disabled={likeActionLoading || !isAuthenticated} color={isLikedByCurrentUser ? "primary" : "inherit"} variant={isLikedByCurrentUser ? "contained" : "outlined"} startIcon={likeActionLoading ? <CircularProgress size={18} color="inherit"/> : <ThumbUpAltIcon />}>
                            {currentLikesCount} Me gusta
                        </Button>
                    </Stack>
                </Paper>
                
                <CommentSection 
                    postId={postId} 
                    postAuthorId={author?.id} 
                    communityCreatorId={community?.createdById} 
                />
            </Container>

            <Dialog open={lightboxOpen} onClose={handleCloseLightbox} maxWidth="xl" PaperProps={{ sx: { backgroundColor: 'rgba(0, 0, 0, 0.9)' } }}>
                <IconButton aria-label="Cerrar" onClick={handleCloseLightbox} sx={{ position: 'absolute', right: 8, top: 8, color: 'white' }}>
                    <CloseIcon />
                </IconButton>
                <Box component="img" src={post?.imageUrl} sx={{ maxWidth: '90vw', maxHeight: '90vh', width: 'auto', height: 'auto' }} />
            </Dialog>
        </>
    );
};

export default PostDetailPage;