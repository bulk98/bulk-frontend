// RUTA: src/pages/CommunityDetailPage.jsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { getCommunityDetails, joinCommunity, leaveCommunity } from '../services/communityService';
import { getPostsByCommunity, toggleLikePost } from '../services/postService';
import { subscribeToCommunityPremium, unsubscribeFromCommunityPremium } from '../services/subscriptionService';
import { useAuth } from '../contexts/AuthContext';
import PostCard from '../components/posts/PostCard'; 
import LockedPostCard from '../components/posts/LockedPostCard';
import CommentDialog from '../components/comments/CommentDialog';
import PostCardSkeleton from '../components/posts/PostCardSkeleton';
import { 
    Container, Typography, Paper, Box, CircularProgress, Alert, Button, Grid, Avatar, 
    Divider, CardMedia, Tooltip, Stack, IconButton, Dialog, Snackbar, Chip, Link,
    DialogTitle, DialogContent, DialogContentText, DialogActions 
} from '@mui/material';

// ===== INICIO DE LA CORRECCIÓN =====
// Se añade 'Star as StarIcon' que faltaba en la lista de importaciones.
import {
    Close as CloseIcon, Edit as EditIcon, PeopleAlt as PeopleAltIcon, Article as ArticleIcon, 
    LockOpen as LockOpenIcon, Lock as LockIcon, AddCircleOutline as AddCircleOutlineIcon, 
    Star as StarIcon, 
    ExitToApp as ExitToAppIcon, Language as LanguageIcon, WorkspacePremium as WorkspacePremiumIcon
} from '@mui/icons-material';
// ===== FIN DE LA CORRECCIÓN =====

const CommunityDetailPage = () => {
    const { communityId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user: authUser, isAuthenticated, token, refreshAuthUserProfile } = useAuth();
    
    // Estados del componente
    const [community, setCommunity] = useState(null);
    const [loadingCommunity, setLoadingCommunity] = useState(true);
    const [errorCommunity, setErrorCommunity] = useState('');
    const [posts, setPosts] = useState([]);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [errorPosts, setErrorPosts] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [postInteractions, setPostInteractions] = useState({});
    const [snackbar, setSnackbar] = useState({ open: false, message: '' });
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');
    const [commentingOnPost, setCommentingOnPost] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [isSubscriptionDialogOpen, setIsSubscriptionDialogOpen] = useState(false);
    const [subscriptionActionLoading, setSubscriptionActionLoading] = useState(false);
    const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);

    // Lógica para el scroll infinito
    const observer = useRef();
    const lastPostElementRef = useCallback(node => {
        if (loadingPosts) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && page < totalPages) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loadingPosts, page, totalPages]);
    
    // Lógica para obtener los datos de la página
    const fetchCommunityData = useCallback((showSuccessMessage = false) => {
        if (!communityId) return;
        setLoadingCommunity(true);
        getCommunityDetails(communityId)
            .then(data => {
              setCommunity(data);
              if (showSuccessMessage) setSnackbar({ open: true, message: '¡Acción realizada con éxito!' });
            })
            .catch(err => setErrorCommunity(err.message || "Error al cargar datos de la comunidad."))
            .finally(() => setLoadingCommunity(false));
    }, [communityId]);

    const fetchPosts = useCallback((pageNum) => {
        if (!communityId) return;
        setLoadingPosts(true);
        getPostsByCommunity(communityId, pageNum)
            .then(data => {
                const updatedPosts = data.posts.map(p => ({ ...p, likesCount: p.likesCount || 0, userHasLiked: p.userHasLiked || false }));
                setPosts(prev => pageNum === 1 ? updatedPosts : [...prev, ...updatedPosts]);
                setTotalPages(data.totalPages || 0);
                const newInteractions = {};
                updatedPosts.forEach(post => { newInteractions[post.id] = { likesCount: post.likesCount, userHasLiked: post.userHasLiked, likeLoading: false }; });
                setPostInteractions(prev => pageNum === 1 ? newInteractions : ({ ...prev, ...newInteractions }));
            })
            .catch(err => setErrorPosts(err.message || 'Error al cargar los posts.'))
            .finally(() => setLoadingPosts(false));
    }, [communityId]);
    
    useEffect(() => {
        setLoadingCommunity(true);
        fetchCommunityData();
    }, [communityId, fetchCommunityData]);
    
    useEffect(() => {
        setPosts([]);
        setPage(1);
        fetchPosts(1);
    }, [communityId, fetchPosts]);

    useEffect(() => {
        if (page > 1) {
            fetchPosts(page);
        }
    }, [page, fetchPosts]);

    // --- Handlers de Interacción ---
    const handleOpenLightbox = useCallback((imageUrl) => { setSelectedImage(imageUrl); setLightboxOpen(true); }, []);
    const handleCloseLightbox = useCallback(() => setLightboxOpen(false), []);
    const handleCommentPost = useCallback((post) => setCommentingOnPost(post), []);
    const handleCloseCommentModal = useCallback(() => setCommentingOnPost(null), []);
    const handleCommentAdded = useCallback((postId) => { fetchPosts(1); }, [fetchPosts]);
    const handleToggleLikePost = useCallback(async (postId) => { if (!token) { return; } setPostInteractions(prev => ({ ...prev, [postId]: { ...prev[postId], likeLoading: true } })); try { const response = await toggleLikePost(postId); setPostInteractions(prev => ({ ...prev, [postId]: { ...prev[postId], likesCount: response.newTotalLikes, userHasLiked: response.reacted, likeLoading: false } })); } catch (error) { console.error("Error en like:", error); setPostInteractions(prev => ({...prev, [postId]: {...prev[postId], likeLoading: false}})); } }, [token]);
    const handleSharePost = useCallback(async (postId) => { const postUrl = `${window.location.origin}/posts/${postId}`; await navigator.clipboard.writeText(postUrl); setSnackbar({ open: true, message: '¡Enlace copiado!' }); }, []);
    
    const handleOpenSubscriptionDialog = () => {
        if (!isAuthenticated) { navigate('/login', { state: { from: location } }); return; }
        setIsSubscriptionDialogOpen(true);
    };

    const handleCloseSubscriptionDialog = useCallback(() => {
        if (!subscriptionActionLoading) setIsSubscriptionDialogOpen(false);
    }, [subscriptionActionLoading]);

    const handleJoinCommunity = useCallback(async () => {
        setActionLoading(true);
        try {
            await joinCommunity(communityId);
            setCommunity(prev => ({ ...prev, currentUserMembership: { ...prev.currentUserMembership, isMember: true, role: 'MEMBER' }, _count: { ...prev._count, memberships: (prev._count.memberships || 0) + 1 } }));
            await refreshAuthUserProfile();
            setSnackbar({ open: true, message: '¡Te has unido a la comunidad!' });
        } catch(err) {
            setSnackbar({ open: true, message: err.message || 'Error al unirse.' });
        } finally {
            setActionLoading(false);
        }
    }, [communityId, refreshAuthUserProfile]);

    const handleLeaveAction = useCallback(async (alsoUnsubscribe) => {
        setIsLeaveDialogOpen(false);
        setActionLoading(true);
        try {
            if (alsoUnsubscribe) {
                await Promise.all([leaveCommunity(communityId), unsubscribeFromCommunityPremium(communityId)]);
            } else {
                await leaveCommunity(communityId);
            }
            fetchCommunityData();
            await refreshAuthUserProfile();
            setSnackbar({ open: true, message: 'Has salido de la comunidad.' });
        } catch(err) {
            setSnackbar({ open: true, message: err.message || 'Error al procesar la acción.' });
        } finally {
            setActionLoading(false);
        }
    }, [communityId, fetchCommunityData, refreshAuthUserProfile]);

    const handleLeaveCommunityClick = () => {
        if (community?.currentUserMembership?.isSubscribed) {
            setIsLeaveDialogOpen(true);
        } else {
            handleLeaveAction(false);
        }
    };
    
    const handleSubscribePremium = useCallback(async () => { 
        setSubscriptionActionLoading(true); 
        try { 
            await subscribeToCommunityPremium(communityId); 
            setSnackbar({ open: true, message: '¡Suscripción exitosa!' });
            setCommunity(prev => ({...prev, currentUserMembership: {...prev.currentUserMembership, isSubscribed: true}}));
            setPage(1);
            fetchPosts(1);
        } catch(err) { 
            setSnackbar({ open: true, message: err.message || 'Error al suscribirte.' });
        } finally { 
            setSubscriptionActionLoading(false); 
            setIsSubscriptionDialogOpen(false);
        }
    }, [communityId, fetchPosts]);
    
    const handleUnsubscribePremium = useCallback(async () => { 
        setSubscriptionActionLoading(true); 
        try { 
            await unsubscribeFromCommunityPremium(communityId); 
            setSnackbar({ open: true, message: 'Suscripción cancelada.' });
            setCommunity(prev => ({...prev, currentUserMembership: {...prev.currentUserMembership, isSubscribed: false}}));
            setPage(1);
            fetchPosts(1);
        } catch(err) { 
            setSnackbar({ open: true, message: err.message || 'Error al cancelar suscripción.' });
        } finally { 
            setSubscriptionActionLoading(false); 
        }
    }, [communityId, fetchPosts]);

    if (loadingCommunity) return <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>;
    if (errorCommunity) return <Container maxWidth="md" sx={{ mt: 4 }}><Alert severity="error">{errorCommunity}</Alert></Container>;
    if (!community) return <Container maxWidth="md" sx={{ mt: 4 }}><Typography variant="h6">Comunidad no encontrada.</Typography></Container>;

    const isCreator = isAuthenticated && authUser?.id === community.createdBy?.id;
    const membershipInfo = community.currentUserMembership;
    const userCanViewPremium = isCreator || membershipInfo?.role === 'MODERATOR' || membershipInfo?.isSubscribed;
    const canCreatePost = membershipInfo?.role === 'CREATOR' || membershipInfo?.role === 'MODERATOR';
    const canPostPremium = isCreator || (membershipInfo?.role === 'MODERATOR' && membershipInfo?.canPublishPremiumContent === true);

    return (
        <>
            <Box sx={{ width: '100%', mb: 3 }}>
                <Paper elevation={4} sx={{ position: 'relative', borderRadius: { xs: 0, sm: 2 }, overflow:'hidden' }}>
                    <CardMedia component="img" image={community.bannerUrl || 'https://placehold.co/1200x300/ECEFF1/B0BEC5?text=Bulk'} alt={`Banner de ${community.name}`} sx={{ width: '100%', height: { xs: 180, sm: 250, md: 300 }, objectFit: 'cover' }} />
                    <Box sx={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0) 100%)' }} />
                    <Box sx={{ p: { xs: 2, md: 3 }, position: 'absolute', bottom: 0, left: 0, width: '100%' }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar variant="rounded" src={community.logoUrl} sx={{ width: {xs: 80, sm: 100 }, height: {xs: 80, sm: 100 }, border: '4px solid white', borderRadius: 2, bgcolor: 'background.paper' }}>{community.name?.charAt(0).toUpperCase()}</Avatar>
                            <Box>
                                <Typography variant="h3" component="h1" sx={{fontWeight: 'bold', color: 'white', lineHeight: 1.1 }}>{community.name}</Typography>
                                <Typography variant="body1" sx={{ color: 'grey.300', mt: 0.5 }}>
                                    Creada por: <Link component={RouterLink} to={`/perfil/${community.createdBy?.id}`} sx={{ color: 'inherit', fontWeight: 'medium' }}>@{community.createdBy?.username || 'desconocido'}</Link>
                                </Typography>
                            </Box>
                        </Stack>
                    </Box>
                </Paper>
            </Box>

            <Container maxWidth="lg">
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6">Descripción</Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 1, whiteSpace: 'pre-wrap', maxWidth: '75ch' }}>{community.description || 'Esta comunidad aún no tiene una descripción.'}</Typography>
                    <Stack direction={{xs:'column', sm:'row'}} spacing={1.5} sx={{ my: 2.5, alignItems: 'flex-start' }}>
                        {isCreator && <Button variant="contained" color="secondary" component={RouterLink} to={`/comunidades/${communityId}/editar`} startIcon={<EditIcon />}>Gestionar Comunidad</Button>}
                        {isAuthenticated && canCreatePost && (<Button variant="contained" color="primary" component={RouterLink} to={`/comunidades/${communityId}/crear-post`} startIcon={<AddCircleOutlineIcon/>} state={{ communityName: community.name, canUserMarkAsPremium: canPostPremium }}>Crear un Post</Button>)}
                        {isAuthenticated && !isCreator && !membershipInfo?.isMember && <Button variant="contained" color="primary" onClick={handleJoinCommunity} disabled={actionLoading}>Unirse</Button>}
                        {isAuthenticated && membershipInfo?.isMember && !isCreator && !membershipInfo?.isSubscribed && <Button variant="contained" color="premium" onClick={handleOpenSubscriptionDialog} disabled={subscriptionActionLoading} startIcon={<StarIcon/>}>Suscribirse a Premium</Button>}
                        {isAuthenticated && membershipInfo?.isMember && !isCreator && membershipInfo?.isSubscribed && <Button variant="outlined" color="premium" onClick={handleUnsubscribePremium} disabled={subscriptionActionLoading}>Cancelar Suscripción</Button>}
                        {isAuthenticated && membershipInfo?.isMember && !isCreator && <Button variant="outlined" color="error" onClick={handleLeaveCommunityClick} disabled={actionLoading} startIcon={<ExitToAppIcon/>}>Salir de la Comunidad</Button>}
                    </Stack>
                </Box>
                
                <Stack direction="row" spacing={3} sx={{ my: 3, p: 2, backgroundColor: (theme) => theme.palette.action.hover, borderRadius: 2, flexWrap:'wrap', justifyContent: 'space-around' }}>
                    <Box sx={{display:'flex', alignItems:'center', gap:1}}><Tooltip title="Visibilidad">{community.esPublica ? <LockOpenIcon /> : <LockIcon />}</Tooltip><Typography>{community.esPublica ? 'Pública' : 'Privada'}</Typography></Box>
                    {community.idiomaPrincipal && (<Box sx={{display:'flex', alignItems:'center', gap:1}}><Tooltip title="Idiomas"><LanguageIcon /></Tooltip><Typography>{community.idiomaPrincipal}{community.idiomaSecundario ? ` / ${community.idiomaSecundario}` : ''}</Typography></Box>)}
                    <Box sx={{display:'flex', alignItems:'center', gap:1}}><Tooltip title="Miembros"><PeopleAltIcon /></Tooltip><Typography>{community._count?.memberships ?? 0} Miembros</Typography></Box>
                    <Box sx={{display:'flex', alignItems:'center', gap:1}}><Tooltip title="Suscritos Premium"><WorkspacePremiumIcon /></Tooltip><Typography>{community.premiumSubscribersCount ?? 0} Suscriptores</Typography></Box>
                    <Box sx={{display:'flex', alignItems:'center', gap:1}}><Tooltip title="Posts"><ArticleIcon /></Tooltip><Typography>{community._count?.posts ?? 0} Posts</Typography></Box>
                </Stack>

                <Box sx={{ my: 4 }}>
                    <Typography variant="h4" component="h2" sx={{fontWeight: 'medium'}}>Posts</Typography>
                    <Divider sx={{my: 3}}/>
                    
                    {loadingPosts && page === 1 ? (
                        <Stack spacing={2}>{ [...Array(3)].map((_, i) => <PostCardSkeleton key={i} />) }</Stack>
                    ) : errorPosts ? (
                        <Alert severity="warning" sx={{my:2}}>{errorPosts}</Alert>
                    ) : posts.length > 0 ? (
                        <Stack spacing={2}>
                            {posts.map((post, index) => {
                                const isLocked = post.esPremium && !userCanViewPremium;
                                const postItem = isLocked ? (
                                    <LockedPostCard 
                                        post={post} 
                                        onSubscribeClick={handleOpenSubscriptionDialog} 
                                    />
                                ) : (
                                    <PostCard 
                                        post={post} 
                                        layout="list" 
                                        onImageClick={handleOpenLightbox} 
                                        interaction={postInteractions[post.id]} 
                                        onLike={handleToggleLikePost} 
                                        onComment={handleCommentPost} 
                                        onShare={handleSharePost} 
                                    />
                                );
                                if (posts.length === index + 1) {
                                    return <div ref={lastPostElementRef} key={post.id}>{postItem}</div>;
                                }
                                return <div key={post.id}>{postItem}</div>;
                            })}
                        </Stack>
                    ) : (
                        <Typography sx={{ mt: 2, fontStyle: 'italic', textAlign:'center', color:'text.secondary' }}>Aún no hay posts en esta comunidad.</Typography>
                    )}
                    
                    {loadingPosts && page > 1 && <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}><CircularProgress /></Box>}
                    {!loadingPosts && page >= totalPages && posts.length > 0 && (<Typography sx={{ textAlign: 'center', color: 'text.secondary', py: 4 }}>Has llegado al final de los posts.</Typography>)}
                </Box>
            </Container>

            <CommentDialog open={!!commentingOnPost} onClose={handleCloseCommentModal} post={commentingOnPost} onCommentAdded={handleCommentAdded} />
            
            <Dialog open={isSubscriptionDialogOpen} onClose={handleCloseSubscriptionDialog}>
                <DialogTitle>Desbloquear Contenido Premium</DialogTitle>
                <DialogContent><DialogContentText>Para ver este y todo el contenido premium de "{community?.name}", necesitas una suscripción. ¿Confirmas la suscripción?</DialogContentText></DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseSubscriptionDialog} disabled={subscriptionActionLoading}>Cancelar</Button>
                    <Button onClick={handleSubscribePremium} variant="contained" color="premium" disabled={subscriptionActionLoading}>
                        {subscriptionActionLoading ? <CircularProgress size={24} /> : 'Sí, suscribirme'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={isLeaveDialogOpen} onClose={() => setIsLeaveDialogOpen(false)}>
                <DialogTitle>Salir de la Comunidad</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Detectamos que tienes una suscripción premium activa. Al salir, puedes mantenerla para seguir apoyando al creador, o cancelarla.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsLeaveDialogOpen(false)}>Cerrar</Button>
                    <Button onClick={() => handleLeaveAction(false)} disabled={actionLoading}>Solo Salir</Button>
                    <Button onClick={() => handleLeaveAction(true)} variant="contained" color="error" disabled={actionLoading}>
                        {actionLoading ? <CircularProgress size={24} /> : 'Salir y Cancelar Suscripción'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={lightboxOpen} onClose={handleCloseLightbox} maxWidth="xl" PaperProps={{ sx: { backgroundColor: 'rgba(0, 0, 0, 0.85)' } }}>
                <IconButton aria-label="Cerrar" onClick={handleCloseLightbox} sx={{ position: 'absolute', right: 8, top: 8, color: 'white' }}><CloseIcon /></IconButton>
                <Box component="img" src={selectedImage} alt="Visualizador de imagen" sx={{ maxWidth: '90vw', maxHeight: '90vh' }} />
            </Dialog>
            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} />
        </>
    );
};

export default CommunityDetailPage;