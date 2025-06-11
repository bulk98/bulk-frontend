import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { getUserFeed } from '../services/userService';
import { toggleLikePost } from '../services/postService';
import { createComment, getCommentsByPost } from '../services/commentService';
import ArticlePostItem from '../components/posts/ArticlePostItem';
import ArticlePostItemSkeleton from '../components/posts/ArticlePostItemSkeleton';
import CommentDialog from '../components/comments/CommentDialog';
import WelcomeFeed from '../components/home/WelcomeFeed'; // 1. Importar el nuevo componente

import { Container, Typography, Paper, Box, CircularProgress, Alert, Button, Divider, Dialog, IconButton, Snackbar, Stack, Grid } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const HomePage = () => {
    const { user, isAuthenticated, loadingAuth, token } = useAuth();
    const navigate = useNavigate();
    const [feedPosts, setFeedPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [postInteractions, setPostInteractions] = useState({});
    const [snackbar, setSnackbar] = useState({ open: false, message: '' });
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');
    const [commentingOnPost, setCommentingOnPost] = useState(null);
    const observer = useRef();
    
    const lastPostElementRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && page < totalPages) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, page, totalPages]);
    
    useEffect(() => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError('');

        getUserFeed(page, 10)
            .then(data => {
                setFeedPosts(prevPosts => {
                    const existingIds = new Set(prevPosts.map(p => p.id));
                    const newPosts = data.posts.filter(p => !existingIds.has(p.id));
                    return page === 1 ? data.posts : [...prevPosts, ...newPosts];
                });
                
                setTotalPages(data.totalPages || 0);

                const newInteractions = {};
                data.posts.forEach(post => {
                    newInteractions[post.id] = {
                        likesCount: post._count?.reactions || 0,
                        userHasLiked: post.userHasLiked || false,
                        likeLoading: false
                    };
                });
                setPostInteractions(prev => ({...prev, ...newInteractions}));
            })
            .catch(err => {
                console.error("Error al obtener el feed:", err);
                setError(err.message || "No se pudo cargar tu feed.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [page, isAuthenticated]);

    useEffect(() => {
        setFeedPosts([]);
        setPage(1);
        setTotalPages(0);
    }, [isAuthenticated]);

    const handleOpenLightbox = useCallback((imageUrl) => {
        setSelectedImage(imageUrl);
        setLightboxOpen(true);
    }, []);
    
    const handleCloseLightbox = useCallback(() => {
        setLightboxOpen(false);
    }, []);

    const handleToggleLikePost = useCallback(async (postId) => {
        if (!token) {
            setSnackbar({ open: true, message: 'Debes iniciar sesión.' });
            return;
        }
        const currentPost = feedPosts.find(p => p.id === postId);
        if (!currentPost) return;
        const currentInteraction = postInteractions[postId];
        if (currentInteraction.likeLoading) return;
        setPostInteractions(prev => ({ ...prev, [postId]: { ...currentInteraction, likeLoading: true, userHasLiked: !currentInteraction.userHasLiked, likesCount: currentInteraction.userHasLiked ? currentInteraction.likesCount - 1 : currentInteraction.likesCount + 1 } }));
        try {
            const response = await toggleLikePost(postId);
            setPostInteractions(prev => ({ ...prev, [postId]: { ...prev[postId], likesCount: response.newTotalLikes, userHasLiked: response.reacted, likeLoading: false } }));
        } catch (error) {
            console.error("Error en like:", error);
            setSnackbar({ open: true, message: 'Error al procesar la reacción.' });
            setPostInteractions(prev => ({ ...prev, [postId]: { ...currentInteraction, likeLoading: false } }));
        }
    }, [token, feedPosts, postInteractions]);

    const handleSharePost = useCallback(async (postId) => {
        const postUrl = `${window.location.origin}/posts/${postId}`;
        try {
            await navigator.clipboard.writeText(postUrl);
            setSnackbar({ open: true, message: '¡Enlace copiado!' });
        } catch (err) {
            setSnackbar({ open: true, message: 'Error al copiar el enlace.' });
        }
    }, []);

    const handleOpenCommentModal = useCallback((post) => {
        setCommentingOnPost(post);
    }, []);

    const handleCloseCommentModal = useCallback(() => {
        setCommentingOnPost(null);
    }, []);

    const handleCommentAdded = useCallback((postId) => {
        setFeedPosts(posts => posts.map(p => 
            p.id === postId 
                ? { ...p, _count: { ...p._count, comments: (p._count.comments || 0) + 1 } } 
                : p
        ));
    }, []);
    
    const renderedPosts = useMemo(() => {
        return feedPosts.map((post, index) => {
            const postItem = (
                <ArticlePostItem 
                    key={post.id}
                    post={post} 
                    interaction={postInteractions[post.id]} 
                    onLike={handleToggleLikePost} 
                    onComment={handleOpenCommentModal} 
                    onShare={handleSharePost}
                    onImageClick={handleOpenLightbox} 
                />
            );
            if (feedPosts.length === index + 1) {
                return <div ref={lastPostElementRef} key={post.id}>{postItem}</div>;
            }
            return postItem;
        });
    }, [feedPosts, postInteractions, lastPostElementRef, handleToggleLikePost, handleOpenCommentModal, handleSharePost, handleOpenLightbox]);

    if (loadingAuth) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
    }

    return (
        <>
            <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
                <Paper elevation={0} variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
                    {isAuthenticated && user && ( <Box sx={{ mb: 2, borderBottom: 1, borderColor: 'divider', pb: 2 }}><Typography variant="h4" component="h1">Tu Feed</Typography></Box>)}
                    
                    {!isAuthenticated ? (
                         <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="h3" component="h1" gutterBottom sx={{ mb: 2, fontWeight: 'bold' }}>Bienvenido a Bulk</Typography>
                            <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>Gestiona y monetiza tus comunidades digitales.</Typography>
                            <Grid container spacing={2} justifyContent="center"><Grid item><Button component={RouterLink} to="/login" variant="contained" color="primary" size="large">Iniciar Sesión</Button></Grid><Grid item><Button component={RouterLink} to="/register" variant="outlined" color="primary" size="large">Registrarme</Button></Grid></Grid>
                        </Box>
                    ) : loading && feedPosts.length === 0 ? (
                        <Stack divider={<Divider />} sx={{mt:0}}>{[...Array(5)].map((_, i) => <ArticlePostItemSkeleton key={i} />)}</Stack>
                    ) : feedPosts.length > 0 ? (
                        <Stack divider={<Divider />}>{renderedPosts}</Stack>
                    ) : (
                        // 2. Lógica de renderizado actualizada para mostrar WelcomeFeed en el estado vacío
                        <WelcomeFeed />
                    )}
                    
                    {loading && feedPosts.length > 0 && (
                        <Box sx={{display:'flex', justifyContent:'center', py:3}}><CircularProgress size={30}/></Box>
                    )}

                    {error && <Alert severity="error" sx={{mt:2}}>{error}</Alert>}
                </Paper>
            </Container>
            
            <CommentDialog 
                open={!!commentingOnPost}
                onClose={handleCloseCommentModal}
                post={commentingOnPost}
                onCommentAdded={handleCommentAdded}
            />
            
            <Dialog open={lightboxOpen} onClose={handleCloseLightbox} maxWidth="xl" PaperProps={{ sx: { backgroundColor: 'rgba(0, 0, 0, 0.85)', boxShadow: 'none', backgroundImage: 'none' } }}>
                <IconButton aria-label="Cerrar visualizador" onClick={handleCloseLightbox} sx={{ position: 'absolute', right: 8, top: 8, color: 'white', backgroundColor: 'rgba(0,0,0,0.4)', '&:hover': {backgroundColor: 'rgba(0,0,0,0.7)'} }}><CloseIcon /></IconButton>
                <Box component="img" src={selectedImage} alt="Visualizador de imagen del post" sx={{ maxWidth: '95vw', maxHeight: '95vh', width: 'auto', height: 'auto' }} />
            </Dialog>
            
            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} />
        </>
    );
};

export default HomePage;