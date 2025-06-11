// src/pages/CommunityDetailPage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { getCommunityDetails, joinCommunity, leaveCommunity } from '../services/communityService';
import { getPostsByCommunity, toggleLikePost } from '../services/postService';
import { subscribeToCommunityPremium, unsubscribeFromCommunityPremium } from '../services/subscriptionService';
import { useAuth } from '../contexts/AuthContext';
import PostCard from '../components/posts/PostCard'; 
import CommentDialog from '../components/comments/CommentDialog';
import PostCardSkeleton from '../components/posts/PostCardSkeleton';
import { Container, Typography, Paper, Box, CircularProgress, Alert, Button, Grid, Avatar, Divider, CardMedia, Tooltip, Stack, IconButton, Dialog, Snackbar, Chip } from '@mui/material';
import {
    Close as CloseIcon, Edit as EditIcon, PeopleAlt as PeopleAltIcon, Article as ArticleIcon, 
    LockOpen as LockOpenIcon, Lock as LockIcon, AddCircleOutline as AddCircleOutlineIcon, 
    Star as StarIcon, ExitToApp as ExitToAppIcon, Language as LanguageIcon, WorkspacePremium as WorkspacePremiumIcon
} from '@mui/icons-material';

const CommunityDetailPage = () => {
    const { communityId } = useParams();
    const navigate = useNavigate();
    const { user: authUser, isAuthenticated, token, refreshAuthUserProfile } = useAuth();
    
    // Estados de la Comunidad
    const [community, setCommunity] = useState(null);
    const [loadingCommunity, setLoadingCommunity] = useState(true);
    const [errorCommunity, setErrorCommunity] = useState('');
    
    // Estados de los Posts y Paginación
    const [posts, setPosts] = useState([]);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [errorPosts, setErrorPosts] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    // Estados de Interacción
    const [postInteractions, setPostInteractions] = useState({});
    const [snackbar, setSnackbar] = useState({ open: false, message: '' });
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');
    const [commentingOnPost, setCommentingOnPost] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [subscriptionActionLoading, setSubscriptionActionLoading] = useState(false);

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
    
    const fetchCommunityData = useCallback(() => {
        if (!communityId) return;
        setLoadingCommunity(true);
        getCommunityDetails(communityId)
            .then(data => setCommunity(data))
            .catch(err => setErrorCommunity(err.message || "Error al cargar datos de la comunidad."))
            .finally(() => setLoadingCommunity(false));
    }, [communityId]);
    
    useEffect(() => {
        fetchCommunityData();
    }, [fetchCommunityData]);
    
    useEffect(() => {
        if (!community) return;
        setLoadingPosts(true);
        getPostsByCommunity(communityId, page)
            .then(data => {
                setPosts(prev => page === 1 ? data.posts : [...prev, ...data.posts]);
                setTotalPages(data.totalPages || 0);
                const newInteractions = {};
                data.posts.forEach(post => { newInteractions[post.id] = { likesCount: post._count?.reactions || 0, userHasLiked: post.userHasLiked || false, likeLoading: false }; });
                setPostInteractions(prev => ({ ...prev, ...newInteractions }));
            })
            .catch(err => setErrorPosts(err.message || 'Error al cargar los posts.'))
            .finally(() => setLoadingPosts(false));
    }, [community, page, communityId]);

    const handleOpenLightbox = useCallback((imageUrl) => { setSelectedImage(imageUrl); setLightboxOpen(true); }, []);
    const handleCloseLightbox = useCallback(() => setLightboxOpen(false), []);
    const handleCommentPost = useCallback((post) => setCommentingOnPost(post), []);
    const handleCloseCommentModal = useCallback(() => setCommentingOnPost(null), []);
    const handleCommentAdded = useCallback((postId) => { setPosts(posts => posts.map(p => p.id === postId ? { ...p, _count: { ...p._count, comments: (p._count.comments || 0) + 1 } } : p)); }, []);
    const handleToggleLikePost = useCallback(async (postId) => { if (!token) return; setPostInteractions(prev => ({ ...prev, [postId]: { ...prev[postId], likeLoading: true } })); try { const response = await toggleLikePost(postId); setPostInteractions(prev => ({ ...prev, [postId]: { ...prev[postId], likesCount: response.newTotalLikes, userHasLiked: response.reacted, likeLoading: false } })); } catch (error) { console.error("Error en like:", error); } }, [token]);
    const handleSharePost = useCallback(async (postId) => { const postUrl = `${window.location.origin}/posts/${postId}`; await navigator.clipboard.writeText(postUrl); setSnackbar({ open: true, message: '¡Enlace copiado!' }); }, []);
    const handleJoinCommunity = useCallback(async () => { setActionLoading(true); try { await joinCommunity(communityId); fetchCommunityData(); await refreshAuthUserProfile(); } catch(err) { console.error(err); } finally { setActionLoading(false); }}, [communityId, fetchCommunityData, refreshAuthUserProfile]);
    const handleLeaveCommunity = useCallback(async () => { setActionLoading(true); try { await leaveCommunity(communityId); fetchCommunityData(); await refreshAuthUserProfile(); } catch(err) { console.error(err); } finally { setActionLoading(false); }}, [communityId, fetchCommunityData, refreshAuthUserProfile]);
    
    const handleSubscribePremium = useCallback(async () => { 
        setSubscriptionActionLoading(true); 
        try { 
            await subscribeToCommunityPremium(communityId); 
            setCommunity(prev => ({...prev, currentUserMembership: {...prev.currentUserMembership, isSubscribed: true}}));
        } catch(err) { console.error(err); } 
        finally { setSubscriptionActionLoading(false); }
    }, [communityId]);
    
    const handleUnsubscribePremium = useCallback(async () => { 
        setSubscriptionActionLoading(true); 
        try { 
            await unsubscribeFromCommunityPremium(communityId); 
            setCommunity(prev => ({...prev, currentUserMembership: {...prev.currentUserMembership, isSubscribed: false}}));
        } catch(err) { console.error(err); } 
        finally { setSubscriptionActionLoading(false); }
    }, [communityId]);

    if (loadingCommunity) { return <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>; }
    if (errorCommunity) { return <Container maxWidth="md" sx={{ mt: 4 }}><Alert severity="error">{errorCommunity}</Alert></Container>; }
    if (!community) { return <Container maxWidth="md" sx={{ mt: 4 }}><Typography variant="h6">Comunidad no encontrada.</Typography></Container>; }

    const isCreator = isAuthenticated && authUser?.id === community.createdBy?.id;
    const membershipInfo = community.currentUserMembership;
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
                            <Box><Typography variant="h3" component="h1" sx={{fontWeight: 'bold', color: 'white', lineHeight: 1.1 }}>{community.name}</Typography><Typography variant="body1" sx={{ color: 'grey.300', mt: 0.5 }}>Creada por: {community.createdBy?.name || 'Desconocido'}</Typography></Box>
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
                        {isAuthenticated && canCreatePost && (
                            <Button 
                                variant="contained" 
                                color="primary" 
                                component={RouterLink} 
                                to={`/comunidades/${communityId}/crear-post`} 
                                startIcon={<AddCircleOutlineIcon/>}
                                state={{
                                    communityName: community.name,
                                    canUserMarkAsPremium: canPostPremium
                                }}
                            >
                                Crear un Post
                            </Button>
                        )}
                        {isAuthenticated && !isCreator && !membershipInfo?.isMember && <Button variant="contained" color="primary" onClick={handleJoinCommunity} disabled={actionLoading}>Unirse</Button>}
                        {isAuthenticated && membershipInfo?.isMember && !isCreator && !membershipInfo?.isSubscribed && <Button variant="contained" color="premium" onClick={handleSubscribePremium} disabled={subscriptionActionLoading} startIcon={<StarIcon/>}>Suscribirse a Premium</Button>}
                        {isAuthenticated && membershipInfo?.isMember && !isCreator && membershipInfo?.isSubscribed && <Button variant="outlined" color="premium" onClick={handleUnsubscribePremium} disabled={subscriptionActionLoading}>Cancelar Suscripción</Button>}
                        {isAuthenticated && membershipInfo?.isMember && !isCreator && <Button variant="outlined" color="error" onClick={handleLeaveCommunity} disabled={actionLoading} startIcon={<ExitToAppIcon/>}>Salir de la Comunidad</Button>}
                    </Stack>
                </Box>
                
                <Stack direction="row" spacing={3} sx={{ my: 3, p: 2, backgroundColor: (theme) => theme.palette.action.hover, borderRadius: 2, flexWrap:'wrap', justifyContent: 'space-around' }}>
                    <Box sx={{display:'flex', alignItems:'center', gap:1}}><Tooltip title="Visibilidad">{community.esPublica ? <LockOpenIcon /> : <LockIcon />}</Tooltip><Typography>{community.esPublica ? 'Pública' : 'Privada'}</Typography></Box>
                    {community.idiomaPrincipal && (<Box sx={{display:'flex', alignItems:'center', gap:1}}><Tooltip title="Idiomas"><LanguageIcon /></Tooltip><Typography>{community.idiomaPrincipal}{community.idiomaSecundario ? ` / ${community.idiomaSecundario}` : ''}</Typography></Box>)}
                    <Box sx={{display:'flex', alignItems:'center', gap:1}}><Tooltip title="Miembros"><PeopleAltIcon /></Tooltip><Typography>{community._count?.memberships ?? 0} Miembros</Typography></Box>
                    <Box sx={{display:'flex', alignItems:'center', gap:1}}><Tooltip title="Suscritos Premium"><WorkspacePremiumIcon /></Tooltip><Typography>{community._count?.premiumSubscribersCount ?? 0} Suscriptores</Typography></Box>
                    <Box sx={{display:'flex', alignItems:'center', gap:1}}><Tooltip title="Posts"><ArticleIcon /></Tooltip><Typography>{community._count?.posts ?? 0} Posts</Typography></Box>
                </Stack>

                <Box sx={{ my: 4 }}>
                    <Typography variant="h4" component="h2" sx={{fontWeight: 'medium'}}>Posts</Typography>
                    <Divider sx={{my: 3}}/>
                    
                    {loadingPosts && posts.length === 0 ? (
                         <Stack spacing={2}>{ [...Array(3)].map((_, i) => <PostCardSkeleton key={i} />) }</Stack>
                    ) : errorPosts ? (
                        <Alert severity="warning" sx={{my:2}}>{errorPosts}</Alert>
                    ) : posts.length > 0 ? (
                        <Stack spacing={2}>
                            {posts.map((post, index) => {
                                const postCard = <PostCard post={post} layout="list" key={post.id} onImageClick={handleOpenLightbox} interaction={postInteractions[post.id]} onLike={handleToggleLikePost} onComment={handleCommentPost} onShare={handleSharePost} />;
                                if (posts.length === index + 1) {
                                    return <div ref={lastPostElementRef} key={post.id}>{postCard}</div>;
                                }
                                return postCard;
                            })}
                        </Stack>
                    ) : (
                         <Typography sx={{ mt: 2, fontStyle: 'italic', textAlign:'center', color:'text.secondary' }}>Aún no hay posts en esta comunidad.</Typography>
                    )}
                    
                    {loadingPosts && posts.length > 0 && <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}><CircularProgress /></Box>}
                    {!loadingPosts && page >= totalPages && posts.length > 0 && (<Typography sx={{ textAlign: 'center', color: 'text.secondary', py: 4 }}>Has llegado al final de los posts.</Typography>)}
                </Box>
            </Container>

            <CommentDialog open={!!commentingOnPost} onClose={handleCloseCommentModal} post={commentingOnPost} onCommentAdded={handleCommentAdded} />
            <Dialog open={lightboxOpen} onClose={handleCloseLightbox} maxWidth="xl" PaperProps={{ sx: { backgroundColor: 'rgba(0, 0, 0, 0.85)' } }}>
                <IconButton aria-label="Cerrar" onClick={handleCloseLightbox} sx={{ position: 'absolute', right: 8, top: 8, color: 'white' }}><CloseIcon /></IconButton>
                <Box component="img" src={selectedImage} alt="Visualizador de imagen" sx={{ maxWidth: '90vw', maxHeight: '90vh' }} />
            </Dialog>
            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} />
        </>
    );
};

export default CommunityDetailPage;