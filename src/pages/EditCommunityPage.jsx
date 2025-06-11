// src/pages/EditCommunityPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    getCommunityDetails,
    updateCommunity,
    uploadCommunityLogo,
    deleteCommunityLogo,
    uploadCommunityBanner,
    deleteCommunityBanner,
    deleteCommunity
} from '../services/communityService';

// Componentes y Pestañas
import CommunityDetailsTab from '../components/communities/CommunityDetailsTab';
import CommunityImagesTab from '../components/communities/CommunityImagesTab';
import CommunityMembersTab from '../components/communities/CommunityMembersTab';

// Importaciones de Material-UI
import { Container, Typography, Paper, Box, CircularProgress, Alert, Button, IconButton, Tabs, Tab, Stack, TextField, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

// Iconos
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InfoIcon from '@mui/icons-material/Info';
import ImageIcon from '@mui/icons-material/Image';
import PeopleIcon from '@mui/icons-material/People';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';


function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`} aria-labelledby={`tab-${index}`} {...other}>
      {value === index && <Box sx={{ p: { xs: 2, md: 3 } }}>{children}</Box>}
    </div>
  );
}

const EditCommunityPage = () => {
    const { communityId } = useParams();
    const navigate = useNavigate();
    const { user: authUser, isAuthenticated } = useAuth();
    
    // Estados para los datos de la comunidad
    const [originalCommunity, setOriginalCommunity] = useState(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    const [idiomaPrincipal, setIdiomaPrincipal] = useState('');
    const [idiomaSecundario, setIdiomaSecundario] = useState('');
    
    // Estados de carga y feedback
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    
    // Estados para imágenes
    const [currentLogoUrl, setCurrentLogoUrl] = useState(null);
    const [selectedLogoFile, setSelectedLogoFile] = useState(null);
    const [logoUploading, setLogoUploading] = useState(false);
    const [logoDeleting, setLogoDeleting] = useState(false);
    const [logoError, setLogoError] = useState('');
    const [logoSuccessMessage, setLogoSuccessMessage] = useState('');
    const logoFileInputRef = useRef(null);
    
    const [currentBannerUrl, setCurrentBannerUrl] = useState(null);
    const [selectedBannerFile, setSelectedBannerFile] = useState(null);
    const [bannerUploading, setBannerUploading] = useState(false);
    const [bannerDeleting, setBannerDeleting] = useState(false);
    const [bannerError, setBannerError] = useState('');
    const [bannerSuccessMessage, setBannerSuccessMessage] = useState('');
    const bannerFileInputRef = useRef(null);
    
    // Estados de UI y diálogo de eliminación
    const [currentTab, setCurrentTab] = useState(0);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');
    
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        setLoading(true);
        setError('');

        getCommunityDetails(communityId)
            .then(data => {
                if (authUser?.id !== data.createdBy?.id) {
                    setError("No tienes permiso para editar esta comunidad.");
                    return;
                }
                setOriginalCommunity(data);
                setName(data.name || '');
                setDescription(data.description || '');
                setIsPublic(data.esPublica ?? true);
                setIdiomaPrincipal(data.idiomaPrincipal || '');
                setIdiomaSecundario(data.idiomaSecundario || '');
                setCurrentLogoUrl(data.logoUrl || null);
                setCurrentBannerUrl(data.bannerUrl || null);
            })
            .catch(err => {
                console.error("Error al cargar datos para editar:", err);
                setError(err.message || "No se pudo cargar la información.");
            })
            .finally(() => {
                setLoading(false);
            });

    }, [communityId, isAuthenticated, authUser, navigate]);
    
    const handleDetailsSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError('');
        setSuccessMessage('');
        try {
            const dataToUpdate = {
                name: name.trim(),
                description: description.trim(),
                esPublica: isPublic,
                idiomaPrincipal: idiomaPrincipal,
                idiomaSecundario: idiomaSecundario || null,
            };
            const updated = await updateCommunity(communityId, dataToUpdate);
            setOriginalCommunity(updated); // Actualiza el estado original para la detección de cambios
            setSuccessMessage('Detalles de la comunidad actualizados con éxito.');
        } catch(err) {
            setError(err.message || 'Error al guardar los cambios.');
        } finally {
            setSaving(false);
        }
    };

    const handleLogoFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedLogoFile(file);
            setCurrentLogoUrl(URL.createObjectURL(file));
            setLogoError('');
            setLogoSuccessMessage('');
        }
    };

    const handleUploadLogo = async () => {
        if (!selectedLogoFile) return;
        setLogoUploading(true);
        setLogoError('');
        try {
            const updated = await uploadCommunityLogo(communityId, selectedLogoFile);
            setCurrentLogoUrl(updated.logoUrl);
            setOriginalCommunity(prev => ({ ...prev, logoUrl: updated.logoUrl }));
            setSelectedLogoFile(null);
            if(logoFileInputRef.current) logoFileInputRef.current.value = "";
            setLogoSuccessMessage('Logo actualizado.');
        } catch (err) {
            setLogoError(err.message || 'Error al subir el logo.');
        } finally {
            setLogoUploading(false);
        }
    };

    const handleDeleteLogo = async () => {
        setLogoDeleting(true);
        setLogoError('');
        try {
            await deleteCommunityLogo(communityId);
            setCurrentLogoUrl(null);
            setOriginalCommunity(prev => ({ ...prev, logoUrl: null }));
            setLogoSuccessMessage('Logo eliminado.');
        } catch (err) {
            setLogoError(err.message || 'Error al eliminar el logo.');
        } finally {
            setLogoDeleting(false);
        }
    };

    const handleBannerFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedBannerFile(file);
            setCurrentBannerUrl(URL.createObjectURL(file));
            setBannerError('');
            setBannerSuccessMessage('');
        }
    };

    const handleUploadBanner = async () => {
        if (!selectedBannerFile) return;
        setBannerUploading(true);
        setBannerError('');
        try {
            const updated = await uploadCommunityBanner(communityId, selectedBannerFile);
            setCurrentBannerUrl(updated.bannerUrl);
            setOriginalCommunity(prev => ({ ...prev, bannerUrl: updated.bannerUrl }));
            setSelectedBannerFile(null);
            if(bannerFileInputRef.current) bannerFileInputRef.current.value = "";
            setBannerSuccessMessage('Banner actualizado.');
        } catch (err) {
            setBannerError(err.message || 'Error al subir el banner.');
        } finally {
            setBannerUploading(false);
        }
    };

    const handleDeleteBanner = async () => {
        setBannerDeleting(true);
        setBannerError('');
        try {
            await deleteCommunityBanner(communityId);
            setCurrentBannerUrl(null);
            setOriginalCommunity(prev => ({ ...prev, bannerUrl: null }));
            setBannerSuccessMessage('Banner eliminado.');
        } catch (err) {
            setBannerError(err.message || 'Error al eliminar el banner.');
        } finally {
            setBannerDeleting(false);
        }
    };
    
    const handleTabChange = (event, newValue) => { setCurrentTab(newValue); };
    
    const openDeleteDialog = () => setIsDeleteDialogOpen(true);
    
    const closeDeleteDialog = () => { 
        setIsDeleteDialogOpen(false); 
        setDeleteConfirmText(''); 
        setDeleteError(''); 
    };

    const handleDeleteCommunity = async () => { 
        if (deleteConfirmText !== originalCommunity?.name) {
            setDeleteError('El nombre de la comunidad no coincide.');
            return;
        }
        setDeleting(true);
        setDeleteError('');
        try {
            await deleteCommunity(communityId);
            navigate('/dashboard'); // Redirigir al dashboard
        } catch (err) {
            setDeleteError(err.message || 'Error al eliminar la comunidad.');
            setDeleting(false);
        }
    };

    if (loading) { return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>; }
    if (error) { return <Container maxWidth="md" sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>; }

    const hasChanges = originalCommunity ? 
        (name.trim() !== originalCommunity.name || 
        description.trim() !== (originalCommunity.description || '') || 
        isPublic !== originalCommunity.esPublica ||
        idiomaPrincipal !== (originalCommunity.idiomaPrincipal || '') ||
        idiomaSecundario !== (originalCommunity.idiomaSecundario || '')) 
        : false;
        
    const isAnyImageActionLoading = logoUploading || logoDeleting || bannerUploading || bannerDeleting;

    return (
        <>
            <Container maxWidth="lg" sx={{ my: 4 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                    <IconButton component={RouterLink} to={`/comunidades/${communityId}`} aria-label="Volver a la comunidad"><ArrowBackIcon /></IconButton>
                    <Typography variant="h4" component="h1">Gestionar: {originalCommunity?.name}</Typography>
                </Stack>
                <Paper variant="outlined" sx={{ borderRadius: 2 }}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs value={currentTab} onChange={handleTabChange} aria-label="Pestañas de gestión" variant="scrollable" scrollButtons="auto">
                            <Tab icon={<InfoIcon />} iconPosition="start" label="Detalles" />
                            <Tab icon={<ImageIcon />} iconPosition="start" label="Imágenes" />
                            <Tab icon={<PeopleIcon />} iconPosition="start" label="Miembros" />
                        </Tabs>
                    </Box>

                    <TabPanel value={currentTab} index={0}>
                        <CommunityDetailsTab
                            name={name} description={description} isPublic={isPublic}
                            idiomaPrincipal={idiomaPrincipal} idiomaSecundario={idiomaSecundario}
                            onNameChange={(e) => setName(e.target.value)}
                            onDescriptionChange={(e) => setDescription(e.target.value)}
                            onIsPublicChange={(e) => setIsPublic(e.target.checked)}
                            onIdiomaPrincipalChange={(e) => setIdiomaPrincipal(e.target.value)}
                            onIdiomaSecundarioChange={(e) => setIdiomaSecundario(e.target.value)}
                            onSubmit={handleDetailsSubmit}
                            saving={saving} error={error} successMessage={successMessage}
                            hasChanges={hasChanges} isAnyImageActionLoading={isAnyImageActionLoading}
                        />
                        <Box sx={{ mt: 5, p: 2, border: 1, borderColor: 'error.main', borderRadius: 2 }}>
                            <Typography variant="h6" color="error.main" gutterBottom>Zona de Peligro</Typography>
                            <Typography variant="body2" sx={{ mb: 2 }}>La eliminación de una comunidad es una acción irreversible y borrará todos sus posts y membresías.</Typography>
                            <Button variant="contained" color="error" onClick={openDeleteDialog} disabled={deleting}>Eliminar esta comunidad</Button>
                        </Box>
                    </TabPanel>
                    <TabPanel value={currentTab} index={1}>
                        <CommunityImagesTab
                            communityName={originalCommunity?.name}
                            currentLogoUrl={currentLogoUrl} selectedLogoFile={selectedLogoFile} logoUploading={logoUploading} logoDeleting={logoDeleting} logoError={logoError} logoSuccessMessage={logoSuccessMessage}
                            logoFileInputRef={logoFileInputRef} handleLogoFileChange={handleLogoFileChange} handleUploadLogo={handleUploadLogo} handleDeleteLogo={handleDeleteLogo}
                            currentBannerUrl={currentBannerUrl} selectedBannerFile={selectedBannerFile} bannerUploading={bannerUploading} bannerDeleting={bannerDeleting} bannerError={bannerError} bannerSuccessMessage={bannerSuccessMessage}
                            bannerFileInputRef={bannerFileInputRef} handleBannerFileChange={handleBannerFileChange} handleUploadBanner={handleUploadBanner} handleDeleteBanner={handleDeleteBanner}
                        />
                    </TabPanel>
                    <TabPanel value={currentTab} index={2}>
                        <CommunityMembersTab communityId={communityId} isVisible={currentTab === 2} />
                    </TabPanel>
                </Paper>
            </Container>

            <Dialog open={isDeleteDialogOpen} onClose={closeDeleteDialog}>
                <DialogTitle sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                    <WarningAmberIcon color="error"/>Confirmar Eliminación Permanente
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>Esta acción no se puede deshacer. Se eliminará permanentemente la comunidad **{originalCommunity?.name}** y todo su contenido.</DialogContentText>
                    <DialogContentText sx={{mt: 2, fontWeight:'bold'}}>Para confirmar, escribe el nombre de la comunidad:</DialogContentText>
                    <TextField autoFocus margin="dense" id="confirm-delete" label="Nombre de la comunidad" type="text" fullWidth variant="standard" value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} error={!!deleteError} helperText={deleteError}/>
                </DialogContent>
                <DialogActions sx={{p: 2}}>
                    <Button onClick={closeDeleteDialog} disabled={deleting}>Cancelar</Button>
                    <Button onClick={handleDeleteCommunity} color="error" variant="contained" disabled={deleting || deleteConfirmText !== originalCommunity?.name}>
                        {deleting ? <CircularProgress size={24}/> : 'Eliminar para siempre'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default EditCommunityPage;