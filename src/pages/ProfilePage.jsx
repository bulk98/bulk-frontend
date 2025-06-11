// src/pages/ProfilePage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile, getPublicUserProfile, updateUserProfile, uploadUserAvatar, deleteUserAvatar } from '../services/userService';
import ProfileActivityTab from '../components/profile/ProfileActivityTab';
import ProfileCommunitiesTab from '../components/profile/ProfileCommunitiesTab';
import { 
    Container, Typography, Paper, Box, Avatar, CircularProgress, Alert, Button, 
    TextField, IconButton, Tabs, Tab, Stack, Snackbar 
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import PersonIcon from '@mui/icons-material/Person';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import RssFeedIcon from '@mui/icons-material/RssFeed';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} id={`profile-tabpanel-${index}`} aria-labelledby={`profile-tab-${index}`} {...other}>
            {value === index && <Box sx={{ p: { xs: 2, sm: 3 } }}>{children}</Box>}
        </div>
    );
}

const ProfilePage = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { user: authUser, loadingAuth, updateAuthUser, refreshAuthUserProfile } = useAuth();
    
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isOwnProfile, setIsOwnProfile] = useState(false);
    const [currentTab, setCurrentTab] = useState(0);

    const [isEditingBio, setIsEditingBio] = useState(false);
    const [bioText, setBioText] = useState('');
    const [savingBio, setSavingBio] = useState(false);

    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    
    const [feedback, setFeedback] = useState({ open: false, message: '', severity: 'info' });
    
    const avatarInputRef = useRef(null);
    
    useEffect(() => {
        const fetchProfileData = async () => {
            if (loadingAuth) return;
            setLoading(true);
            setError('');
            
            try {
                const profileIdToFetch = userId || authUser?.id;
                
                if (!profileIdToFetch) {
                    navigate('/login');
                    return;
                }

                const data = userId 
                    ? await getPublicUserProfile(userId) 
                    : await getUserProfile();

                setProfileData(data);
                setBioText(data.bio || '');
                setIsOwnProfile(authUser?.id === data.id);
            } catch (err) {
                setError(err.message || 'No se pudo cargar el perfil.');
            } finally {
                setLoading(false);
            }
        };
        fetchProfileData();
    }, [userId, authUser, loadingAuth, navigate]);

    const handleTabChange = (event, newValue) => setCurrentTab(newValue);

    const handleSaveBio = async () => {
        if (bioText.trim() === (profileData.bio || '')) {
            setIsEditingBio(false);
            return;
        }
        setSavingBio(true);
        setFeedback({ open: false, message: '' });
        try {
            const updatedProfile = await updateUserProfile({ bio: bioText.trim() });
            updateAuthUser(updatedProfile);
            setProfileData(prev => ({ ...prev, bio: updatedProfile.bio }));
            setFeedback({ open: true, message: 'Biografía actualizada con éxito.', severity: 'success' });
        } catch (err) {
            setFeedback({ open: true, message: err.message || 'Error al guardar la biografía.', severity: 'error' });
        } finally {
            setSavingBio(false);
            setIsEditingBio(false);
        }
    };
    
    const handleAvatarFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };
    const handleCancelAvatarChange = () => {
        setAvatarFile(null);
        setAvatarPreview(null);
        if (avatarInputRef.current) avatarInputRef.current.value = "";
    };
    const handleUploadAvatar = async () => {
        if (!avatarFile) return;
        setIsUploading(true);
        try {
            const updatedProfile = await uploadUserAvatar(avatarFile);
            await refreshAuthUserProfile();
            setProfileData(prev => ({ ...prev, avatarUrl: updatedProfile.avatarUrl }));
            handleCancelAvatarChange();
            setFeedback({ open: true, message: 'Avatar actualizado con éxito.', severity: 'success' });
        } catch (err) {
             setFeedback({ open: true, message: err.message || 'Error al subir el avatar.', severity: 'error' });
        } finally {
            setIsUploading(false);
        }
    };
    const handleDeleteAvatar = async () => {
        setIsDeleting(true);
        try {
            const updatedProfile = await deleteUserAvatar();
            await refreshAuthUserProfile();
            setProfileData(prev => ({ ...prev, avatarUrl: updatedProfile.avatarUrl }));
            setFeedback({ open: true, message: 'Avatar eliminado.', severity: 'success' });
        } catch (err) {
            setFeedback({ open: true, message: err.message || 'Error al eliminar el avatar.', severity: 'error' });
        } finally {
            setIsDeleting(false);
        }
    };

    if (loading || loadingAuth) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
    }
    
    if (error) {
        return <Container maxWidth="md" sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>;
    }
    
    if (!profileData) {
        return <Container maxWidth="md" sx={{ mt: 4 }}><Alert severity="warning">No se encontraron datos del perfil.</Alert></Container>;
    }
    
    const anyAvatarActionLoading = isUploading || isDeleting;

    return (
        <Container maxWidth="lg" sx={{ my: 4 }}>
            <Paper variant="outlined" sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, borderRadius: 2, overflow: 'hidden' }}>
                <Stack spacing={2} sx={{ p: 4, borderRight: { xs: 0, md: 1 }, borderColor: 'divider', alignItems: 'center', textAlign: 'center', width: { xs: '100%', md: '300px' } }}>
                    <Box sx={{ position: 'relative' }}>
                        <input type="file" hidden accept="image/*" ref={avatarInputRef} onChange={handleAvatarFileChange}/>
                        <Avatar src={avatarPreview || profileData.avatarUrl} sx={{ width: 120, height: 120, mb: 1, fontSize: '3.5rem' }}>
                            {profileData.name?.charAt(0).toUpperCase()}
                        </Avatar>
                        {isOwnProfile && !anyAvatarActionLoading && (
                            <IconButton sx={{ position: 'absolute', bottom: 8, right: 8, bgcolor: 'background.paper' }} onClick={() => avatarInputRef.current.click()} size="small" aria-label="Cambiar avatar">
                                <PhotoCameraIcon />
                            </IconButton>
                        )}
                         {anyAvatarActionLoading && <CircularProgress sx={{ position: 'absolute', top: '50%', left: '50%', mt: '-20px', ml: '-20px' }} />}
                    </Box>
                    
                    {isOwnProfile && (
                        <Stack spacing={1} sx={{ minHeight: '60px' }}>
                            {avatarPreview && !anyAvatarActionLoading && (
                                <Stack direction="row" spacing={1}>
                                    <Button variant="contained" size="small" onClick={handleUploadAvatar}>Confirmar</Button>
                                    <Button variant="outlined" size="small" onClick={handleCancelAvatarChange}>Cancelar</Button>
                                </Stack>
                            )}
                            {profileData.avatarUrl && !avatarPreview && !anyAvatarActionLoading && (
                                 <Button size="small" color="error" onClick={handleDeleteAvatar} startIcon={<DeleteForeverIcon />}>Eliminar foto</Button>
                            )}
                        </Stack>
                    )}

                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{profileData.name || profileData.username}</Typography>
                        <Typography color="text.secondary">@{profileData.username}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{display:'block', mt:1}}>
                            Miembro desde {new Date(profileData.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })}
                        </Typography>
                    </Box>
                     {isOwnProfile && <Button component="a" href="/perfil/editar" variant="outlined" size="small">Editar Información</Button>}
                </Stack>
                <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs value={currentTab} onChange={handleTabChange} variant="fullWidth">
                            <Tab icon={<PersonIcon />} iconPosition="start" label="Perfil" />
                            <Tab icon={<RssFeedIcon />} iconPosition="start" label="Actividad" />
                            <Tab icon={<Diversity3Icon />} iconPosition="start" label="Comunidades" />
                        </Tabs>
                    </Box>
                    
                    <TabPanel value={currentTab} index={0}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                            <Typography variant="h6" gutterBottom>Biografía</Typography>
                            {isOwnProfile && !isEditingBio && (
                                <IconButton size="small" onClick={() => setIsEditingBio(true)}><EditIcon fontSize="small" /></IconButton>
                            )}
                        </Stack>

                        {isOwnProfile && isEditingBio ? (
                            <Stack spacing={1}>
                                <TextField fullWidth multiline rows={4} value={bioText} onChange={(e) => setBioText(e.target.value)} disabled={savingBio} autoFocus/>
                                <Stack direction="row" spacing={1} justifyContent="flex-end">
                                    <Button onClick={() => { setIsEditingBio(false); setBioText(profileData.bio || ''); }} disabled={savingBio}>Cancelar</Button>
                                    <Button onClick={handleSaveBio} disabled={savingBio} variant="contained" startIcon={savingBio ? <CircularProgress size={16}/> : <SaveIcon />}>Guardar</Button>
                                </Stack>
                            </Stack>
                        ) : (
                            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', color: profileData.bio ? 'text.primary' : 'text.secondary', fontStyle: profileData.bio ? 'normal' : 'italic' }}>
                                {profileData.bio || (isOwnProfile ? 'Aún no has añadido una biografía. ¡Haz clic en el lápiz para empezar!' : 'Este usuario aún no ha añadido una biografía.')}
                            </Typography>
                        )}
                    </TabPanel>

                    <TabPanel value={currentTab} index={1}><ProfileActivityTab userId={profileData.id} /></TabPanel>
                    <TabPanel value={currentTab} index={2}><ProfileCommunitiesTab userId={profileData.id} /></TabPanel>
                </Box>
            </Paper>

            <Snackbar 
                open={feedback.open} 
                autoHideDuration={6000} 
                onClose={() => setFeedback(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setFeedback(prev => ({ ...prev, open: false }))} severity={feedback.severity} sx={{ width: '100%' }}>
                    {feedback.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default ProfilePage;