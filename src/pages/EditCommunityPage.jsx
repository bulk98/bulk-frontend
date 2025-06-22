// RUTA: src/pages/EditCommunityPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
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

import CommunityDetailsTab from '../components/communities/CommunityDetailsTab';
import CommunityImagesTab from '../components/communities/CommunityImagesTab';
import CommunityMembersTab from '../components/communities/CommunityMembersTab';
import CommunitySubscribersTab from '../components/communities/CommunitySubscribersTab';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';

import { Container, Typography, Paper, Box, CircularProgress, Alert, Button, IconButton, Tabs, Tab, Stack, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Info as InfoIcon, Image as ImageIcon, People as PeopleIcon, WarningAmber as WarningAmberIcon } from '@mui/icons-material';

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
    const { user: authUser } = useAuth();
    
    // --- ESTADO UNIFICADO ---
    const [originalCommunity, setOriginalCommunity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [serverError, setServerError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    
    // MODIFICADO: Se usa una sola variable para el estado de las pestañas
    const [currentTab, setCurrentTab] = useState(0); 
    
    const {
        control, register, handleSubmit, setValue,
        formState: { errors, isSubmitting, isDirty },
        reset, watch
    } = useForm();
    
    // Estados para las imágenes
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
    
    // Estados para la eliminación
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    // --- MANEJADOR DE PESTAÑAS CORREGIDO ---
    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    // --- HOOKS DE EFECTO (CORREGIDOS) ---
    useEffect(() => {
        if (!authUser) return;
        setLoading(true);
        getCommunityDetails(communityId)
            .then(data => {
                if (authUser.id !== data.createdBy?.id) {
                    setServerError("No tienes permiso para editar esta comunidad.");
                    setLoading(false);
                    return;
                }
                setOriginalCommunity(data);
                
                const defaultValues = {
                    name: data.name || '',
                    description: data.description || '',
                    esPublica: data.esPublica ?? true,
                    idiomaPrincipal: data.idiomaPrincipal || '',
                    idiomaSecundario: data.idiomaSecundario || ''
                };
                reset(defaultValues);
                
                setCurrentLogoUrl(data.logoUrl || null);
                setCurrentBannerUrl(data.bannerUrl || null);
            })
            .catch(err => setServerError(err.message || "No se pudo cargar la información."))
            .finally(() => setLoading(false));
    }, [communityId, authUser, reset]);
    
    // --- LÓGICA DE MANEJADORES (SIN CAMBIOS) ---
    const onDetailsSubmit = async (data) => {
        setSuccessMessage('');
        setServerError('');
        try {
            const updated = await updateCommunity(communityId, data);
            setSuccessMessage('Detalles de la comunidad actualizados con éxito.');
            reset(data);
        } catch(err) {
            setServerError(err.message || 'Error al guardar los cambios.');
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
    
    const openDeleteDialog = () => setIsDeleteDialogOpen(true);
    const closeDeleteDialog = () => { setIsDeleteDialogOpen(false); setDeleteConfirmText(''); setDeleteError(''); };

    const handleDeleteCommunity = async () => { 
        if (deleteConfirmText !== originalCommunity?.name) {
            setDeleteError('El nombre de la comunidad no coincide.');
            return;
        }
        setDeleting(true);
        setDeleteError('');
        try {
            await deleteCommunity(communityId);
            navigate('/dashboard');
        } catch (err) {
            setDeleteError(err.message || 'Error al eliminar la comunidad.');
            setDeleting(false);
        }
    };

    if (loading) { return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>; }
    if (serverError && !originalCommunity) { return <Container maxWidth="md" sx={{ mt: 4 }}><Alert severity="error">{serverError}</Alert></Container>; }

    return (
        <Container maxWidth="lg" sx={{ my: 4 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                <IconButton component={RouterLink} to={`/comunidades/${communityId}`}><ArrowBackIcon /></IconButton>
                <Typography variant="h4" component="h1">Gestionar: {originalCommunity?.name}</Typography>
            </Stack>
            <Paper variant="outlined" sx={{ borderRadius: 2 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={currentTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
                        <Tab icon={<InfoIcon />} iconPosition="start" label="Detalles" />
                        <Tab icon={<ImageIcon />} iconPosition="start" label="Imágenes" />
                        <Tab icon={<PeopleIcon />} iconPosition="start" label="Miembros" />
                        <Tab icon={<SupervisorAccountIcon />} iconPosition="start" label="Suscriptores" />
                    </Tabs>
                </Box>

                <TabPanel value={currentTab} index={0}>
                    <CommunityDetailsTab
                        onSubmit={handleSubmit(onDetailsSubmit)}
                        control={control}
                        register={register}
                        errors={errors}
                        isSubmitting={isSubmitting}
                        isDirty={isDirty}
                        watch={watch}
                        serverError={serverError}
                        successMessage={successMessage}
                    />
                    <Box sx={{ mt: 5, p: 2, border: 1, borderColor: 'error.main', borderRadius: 2 }}>
                        <Typography variant="h6" color="error.main">Zona de Peligro</Typography>
                        <Typography variant="body2" sx={{ mb: 2 }}>La eliminación de una comunidad es una acción irreversible.</Typography>
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

                <TabPanel value={currentTab} index={3}>
                    <CommunitySubscribersTab />
                </TabPanel>

            </Paper>

            <Dialog open={isDeleteDialogOpen} onClose={closeDeleteDialog}>
                <DialogTitle sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                    <WarningAmberIcon color="error"/>Confirmar Eliminación Permanente
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>Esta acción no se puede deshacer. Se eliminará permanentemente la comunidad <strong>{originalCommunity?.name}</strong> y todo su contenido.</DialogContentText>
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
        </Container>
    );
};

export default EditCommunityPage;