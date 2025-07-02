import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import {
    getCommunityDetails, updateCommunity, uploadCommunityLogo, deleteCommunityLogo,
    uploadCommunityBanner, deleteCommunityBanner, deleteCommunity
} from '../services/communityService';
import { Container, Typography, Paper, Box, CircularProgress, Alert, Button, IconButton, Tabs, Tab, Stack, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Info as InfoIcon, Image as ImageIcon, WarningAmber as WarningAmberIcon } from '@mui/icons-material';
import CommunityDetailsTab from '../components/communities/CommunityDetailsTab';
import CommunityImagesTab from '../components/communities/CommunityImagesTab';

function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`} {...other}>
            {value === index && <Box sx={{ p: { xs: 2, md: 3 } }}>{children}</Box>}
        </div>
    );
}

const EditCommunityDetailsPage = () => {
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
    
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    const handleTabChange = (event, newValue) => setCurrentTab(newValue);

    useEffect(() => {
        if (!authUser) return;
        setLoading(true);
        getCommunityDetails(communityId)
            .then(data => {
                if (authUser.id !== data.createdBy?.id) {
                    navigate('/'); // Redirigir si no es el creador
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
            })
            .catch(err => setServerError(err.message || "No se pudo cargar la información."))
            .finally(() => setLoading(false));
    }, [communityId, authUser, reset, navigate]);
    
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

    // ... (Todas tus funciones handle para logo y banner van aquí sin cambios) ...
    const handleLogoFileChange = (e) => { /*...*/ };
    const handleUploadLogo = async () => { /*...*/ };
    const handleDeleteLogo = async () => { /*...*/ };
    const handleBannerFileChange = (e) => { /*...*/ };
    const handleUploadBanner = async () => { /*...*/ };
    const handleDeleteBanner = async () => { /*...*/ };
    const openDeleteDialog = () => setIsDeleteDialogOpen(true);
    const closeDeleteDialog = () => { setIsDeleteDialogOpen(false); setDeleteConfirmText(''); setDeleteError(''); };
    const handleDeleteCommunity = async () => { /*...*/ };
    
    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
    if (serverError && !originalCommunity) return <Container sx={{ mt: 4 }}><Alert severity="error">{serverError}</Alert></Container>;

    return (
        <Container maxWidth="lg" sx={{ my: 4 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                <IconButton component={RouterLink} to={`/comunidades/${communityId}/gestionar`}><ArrowBackIcon /></IconButton>
                <Typography variant="h4" component="h1">Editar Información: {originalCommunity?.name}</Typography>
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
                     <Box sx={{ mt: 5, p: 2, border: 1, borderColor: 'error.main', borderRadius: 2 }}>
                        <Typography variant="h6" color="error.main">Zona de Peligro</Typography>
                        <Typography variant="body2" sx={{ mb: 2 }}>La eliminación de una comunidad es una acción irreversible y borrará todo su contenido.</Typography>
                        <Button variant="contained" color="error" onClick={openDeleteDialog} disabled={deleting}>Eliminar esta comunidad</Button>
                    </Box>
                </TabPanel>
            </Paper>

            <Dialog open={isDeleteDialogOpen} onClose={closeDeleteDialog}>
                {/* ... (Contenido del Dialog de eliminación) ... */}
            </Dialog>
        </Container>
    );
};

export default EditCommunityDetailsPage;