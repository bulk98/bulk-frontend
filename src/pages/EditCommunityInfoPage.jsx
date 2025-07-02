import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { Container, Typography, Paper, Box, CircularProgress, Alert, Button, IconButton, Tabs, Tab, Stack, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Info as InfoIcon, Image as ImageIcon, WarningAmber as WarningAmberIcon } from '@mui/icons-material';

function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`} aria-labelledby={`tab-${index}`} {...other}>
            {value === index && <Box sx={{ p: { xs: 2, md: 3 } }}>{children}</Box>}
        </div>
    );
}

const EditCommunityInfoPage = () => {
    const { communityId } = useParams();
    const navigate = useNavigate();
    const { user: authUser } = useAuth();
    
    const [originalCommunity, setOriginalCommunity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [serverError, setServerError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [currentTab, setCurrentTab] = useState(0);

    const { control, register, handleSubmit, formState: { errors, isSubmitting, isDirty }, reset, watch } = useForm();
    
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
    
    // ===== INICIO DE LA CORRECCIÓN (LÓGICA FALTANTE) =====
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');
    // ===== FIN DE LA CORRECCIÓN =====

    const handleTabChange = (event, newValue) => setCurrentTab(newValue);

    const fetchCommunityData = useCallback(async () => {
        if (!authUser) return;
        setLoading(true);
        try {
            const data = await getCommunityDetails(communityId);
            if (authUser.id !== data.createdBy?.id) {
                navigate('/');
                return;
            }
            setOriginalCommunity(data);
            reset({
                name: data.name || '',
                description: data.description || '',
                esPublica: data.esPublica ?? true,
                idiomaPrincipal: data.idiomaPrincipal || '',
                idiomaSecundario: data.idiomaSecundario || ''
            });
            setCurrentLogoUrl(data.logoUrl || null);
            setCurrentBannerUrl(data.bannerUrl || null);
        } catch (err) {
            setServerError(err.message || "No se pudo cargar la información.");
        } finally {
            setLoading(false);
        }
    }, [communityId, authUser, reset, navigate]);

    useEffect(() => {
        fetchCommunityData();
    }, [fetchCommunityData]);
    
    const onDetailsSubmit = async (data) => {
        setSuccessMessage(''); setServerError('');
        try {
            await updateCommunity(communityId, data);
            setSuccessMessage('Detalles actualizados con éxito.');
            reset(data, { keepDirty: false });
        } catch(err) {
            setServerError(err.message || 'Error al guardar los cambios.');
        }
    };

    // ===== INICIO DE LA CORRECCIÓN (HANDLERS FALTANTES) =====
    const handleLogoFileChange = (e) => { const file = e.target.files[0]; if (file) { setSelectedLogoFile(file); setCurrentLogoUrl(URL.createObjectURL(file)); setLogoError(''); setLogoSuccessMessage(''); } };
    const handleUploadLogo = async () => { if (!selectedLogoFile) return; setLogoUploading(true); setLogoError(''); try { const updated = await uploadCommunityLogo(communityId, selectedLogoFile); setCurrentLogoUrl(updated.logoUrl); setOriginalCommunity(p => ({ ...p, logoUrl: updated.logoUrl })); setSelectedLogoFile(null); if(logoFileInputRef.current) logoFileInputRef.current.value = ""; setLogoSuccessMessage('Logo actualizado.'); } catch (err) { setLogoError(err.message || 'Error al subir.'); } finally { setLogoUploading(false); } };
    const handleDeleteLogo = async () => { setLogoDeleting(true); setLogoError(''); try { await deleteCommunityLogo(communityId); setCurrentLogoUrl(null); setOriginalCommunity(p => ({ ...p, logoUrl: null })); setLogoSuccessMessage('Logo eliminado.'); } catch (err) { setLogoError(err.message || 'Error al eliminar.'); } finally { setLogoDeleting(false); } };
    const handleBannerFileChange = (e) => { const file = e.target.files[0]; if (file) { setSelectedBannerFile(file); setCurrentBannerUrl(URL.createObjectURL(file)); setBannerError(''); setBannerSuccessMessage(''); } };
    const handleUploadBanner = async () => { if (!selectedBannerFile) return; setBannerUploading(true); setBannerError(''); try { const updated = await uploadCommunityBanner(communityId, selectedBannerFile); setCurrentBannerUrl(updated.bannerUrl); setOriginalCommunity(p => ({ ...p, bannerUrl: updated.bannerUrl })); setSelectedBannerFile(null); if(bannerFileInputRef.current) bannerFileInputRef.current.value = ""; setBannerSuccessMessage('Banner actualizado.'); } catch (err) { setBannerError(err.message || 'Error al subir.'); } finally { setBannerUploading(false); } };
    const handleDeleteBanner = async () => { setBannerDeleting(true); setBannerError(''); try { await deleteCommunityBanner(communityId); setCurrentBannerUrl(null); setOriginalCommunity(p => ({ ...p, bannerUrl: null })); setBannerSuccessMessage('Banner eliminado.'); } catch (err) { setBannerError(err.message || 'Error al eliminar.'); } finally { setBannerDeleting(false); } };
    const openDeleteDialog = () => setIsDeleteDialogOpen(true);
    const closeDeleteDialog = () => { setIsDeleteDialogOpen(false); setDeleteConfirmText(''); setDeleteError(''); };
    const handleDeleteCommunity = async () => { if (deleteConfirmText !== originalCommunity?.name) { setDeleteError('El nombre de la comunidad no coincide.'); return; } setDeleting(true); setDeleteError(''); try { await deleteCommunity(communityId); navigate('/dashboard'); } catch (err) { setDeleteError(err.message || 'Error al eliminar.'); setDeleting(false); } };
    // ===== FIN DE LA CORRECCIÓN =====

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
    if (serverError && !originalCommunity) return <Container sx={{ mt: 4 }}><Alert severity="error">{serverError}</Alert></Container>;

    return (
        <Container maxWidth="lg" sx={{ my: 4 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                <IconButton component={RouterLink} to={`/comunidades/${communityId}/gestionar`}><ArrowBackIcon /></IconButton>
                <Typography variant="h4" component="h1">Editar Comunidad: {originalCommunity?.name}</Typography>
            </Stack>
            <Paper variant="outlined" sx={{ borderRadius: 2 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={currentTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
                        <Tab icon={<InfoIcon />} iconPosition="start" label="Detalles" />
                        <Tab icon={<ImageIcon />} iconPosition="start" label="Imágenes" />
                        <Tab icon={<WarningAmberIcon />} iconPosition="start" label="Zona de Peligro" />
                    </Tabs>
                </Box>
                <TabPanel value={currentTab} index={0}>
                    <CommunityDetailsTab onSubmit={handleSubmit(onDetailsSubmit)} control={control} register={register} errors={errors} isSubmitting={isSubmitting} isDirty={isDirty} watch={watch} serverError={serverError} successMessage={successMessage} />
                </TabPanel>
                <TabPanel value={currentTab} index={1}>
                    <CommunityImagesTab communityName={originalCommunity?.name} currentLogoUrl={currentLogoUrl} selectedLogoFile={selectedLogoFile} logoUploading={logoUploading} logoDeleting={logoDeleting} logoError={logoError} logoSuccessMessage={logoSuccessMessage} logoFileInputRef={logoFileInputRef} handleLogoFileChange={handleLogoFileChange} handleUploadLogo={handleUploadLogo} handleDeleteLogo={handleDeleteLogo} currentBannerUrl={currentBannerUrl} selectedBannerFile={selectedBannerFile} bannerUploading={bannerUploading} bannerDeleting={bannerDeleting} bannerError={bannerError} bannerSuccessMessage={bannerSuccessMessage} bannerFileInputRef={bannerFileInputRef} handleBannerFileChange={handleBannerFileChange} handleUploadBanner={handleUploadBanner} handleDeleteBanner={handleDeleteBanner} />
                </TabPanel>
                <TabPanel value={currentTab} index={2}>
                     <Box sx={{ p: 2, border: 1, borderColor: 'error.main', borderRadius: 2 }}>
                        <Typography variant="h6" color="error.main">Zona de Peligro</Typography>
                        <Typography variant="body2" sx={{ mb: 2 }}>La eliminación de una comunidad es una acción irreversible y borrará todo su contenido.</Typography>
                        <Button variant="contained" color="error" onClick={openDeleteDialog} disabled={deleting}>Eliminar esta comunidad</Button>
                    </Box>
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

export default EditCommunityInfoPage;