import React, { useState, useEffect, useCallback } from 'react';
import { getManagementInfo } from '../services/userService';
import { leaveCommunity } from '../services/communityService';
import { unsubscribeFromCommunityPremium } from '../services/subscriptionService';
import { useAuth } from '../contexts/AuthContext';
import { 
    Container, Typography, Paper, Box, CircularProgress, Alert, Button,
    List, ListItem, ListItemAvatar, Avatar, ListItemText, Divider, Stack,
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Link
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import GroupIcon from '@mui/icons-material/Group';
import StarIcon from '@mui/icons-material/Star';

const ManagementList = ({ title, icon, items, onAction, actionLabel, actionColor, emptyText, loading }) => (
    <Box>
        <Typography variant="h6" component="h3" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            {icon}
            {title}
        </Typography>
        {items.length > 0 ? (
            <List disablePadding>
                {items.map((item, index) => (
                    <React.Fragment key={item.id}>
                        <ListItem
                            secondaryAction={
                                <Button edge="end" variant="outlined" color={actionColor || "error"} onClick={() => onAction(item)} disabled={loading}>
                                    {actionLabel}
                                </Button>
                            }
                        >
                            <ListItemAvatar>
                                <Avatar component={RouterLink} to={`/comunidades/${item.id}`} src={item.logoUrl} />
                            </ListItemAvatar>
                            <ListItemText
                                primary={<Link component={RouterLink} to={`/comunidades/${item.id}`} color="inherit" underline="hover">{item.name}</Link>}
                                secondary={`${item._count.memberships} Miembros`}
                            />
                        </ListItem>
                        {index < items.length - 1 && <Divider component="li" />}
                    </React.Fragment>
                ))}
            </List>
        ) : (
            <Typography sx={{ p: 2, textAlign: 'center', color: 'text.secondary', fontStyle: 'italic' }}>
                {emptyText}
            </Typography>
        )}
    </Box>
);

const SubscriptionsManagementPage = () => {
    const { refreshAuthUserProfile } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [memberships, setMemberships] = useState([]);
    const [moderatorMemberships, setModeratorMemberships] = useState([]);
    const [subscriptions, setSubscriptions] = useState([]);

    const [actionLoading, setActionLoading] = useState(false);
    const [itemToProcess, setItemToProcess] = useState(null);
    const [isConfirmOpen, setConfirmOpen] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getManagementInfo();
            setMemberships(data.memberOfCommunities || []);
            setModeratorMemberships(data.moderatorOfCommunities || []);
            setSubscriptions(data.subscribedToCommunities || []);
            setError(null);
        } catch (err) {
            setError(err.message || 'Error al cargar los datos.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleLeaveClick = (community) => {
        setItemToProcess({ action: 'leave', data: community });
        setConfirmOpen(true);
    };

    const handleUnsubscribeClick = (community) => {
        setItemToProcess({ action: 'unsubscribe', data: community });
        setConfirmOpen(true);
    };

    const handleConfirmAction = async () => {
        if (!itemToProcess) return;
        
        setActionLoading(true);
        try {
            if (itemToProcess.action === 'leave') {
                await leaveCommunity(itemToProcess.data.id);
            } else if (itemToProcess.action === 'unsubscribe') {
                await unsubscribeFromCommunityPremium(itemToProcess.data.id);
            }
            await refreshAuthUserProfile();
            await fetchData();
        } catch (err) {
            setError(err.message || 'Ocurrió un error al procesar la acción.');
        } finally {
            setActionLoading(false);
            setConfirmOpen(false);
            setItemToProcess(null);
        }
    };
    
    const getDialogText = () => {
        if (!itemToProcess) return '';
        if (itemToProcess.action === 'leave') {
            return `¿Estás seguro de que quieres salir de la comunidad "${itemToProcess.data.name}"? Perderás tu rol actual.`;
        }
        return `¿Estás seguro de que quieres cancelar tu suscripción a "${itemToProcess.data.name}"?`;
    };

    if (loading) {
        return <Container sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Container>;
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Roles y Membresías
            </Typography>

            {/* NUEVO: Texto explicativo */}
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Desde aquí puedes administrar todas las comunidades de las que formas parte, tus suscripciones premium y los roles de moderador que te han sido asignados.
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            {/* MODIFICADO: Nueva estructura con dos cuadros separados */}
            <Stack spacing={4}>
                {/* Cuadro para Membresías y Suscripciones */}
                <Paper variant="outlined">
                    <Typography variant="h5" component="h2" sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                        Mis Comunidades y Suscripciones
                    </Typography>
                    <Box sx={{ p: { xs: 1, sm: 2 } }}>
                        <ManagementList
                            title="Comunidades de las que soy miembro"
                            icon={<GroupIcon color="action"/>}
                            items={memberships}
                            onAction={handleLeaveClick}
                            actionLabel="Salir"
                            emptyText="Actualmente no eres miembro de ninguna comunidad."
                            loading={actionLoading}
                        />
                        <Divider sx={{ my: 2 }} />
                        <ManagementList
                            title="Suscripciones Premium activas"
                            icon={<StarIcon sx={{color: '#FFD700'}}/>}
                            items={subscriptions}
                            onAction={handleUnsubscribeClick}
                            actionLabel="Cancelar Suscripción"
                            emptyText="No tienes suscripciones premium activas."
                            loading={actionLoading}
                        />
                    </Box>
                </Paper>

                {/* Cuadro para Roles de Moderador */}
                <Paper variant="outlined">
                    <Typography variant="h5" component="h2" sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                        Comunidades que Modero
                    </Typography>
                    <Box sx={{ p: { xs: 1, sm: 2 } }}>
                        <ManagementList
                            title="Rol de Moderador"
                            icon={<SupervisorAccountIcon color="primary"/>}
                            items={moderatorMemberships}
                            onAction={handleLeaveClick}
                            actionLabel="Dejar de moderar"
                            emptyText="No estás moderando ninguna comunidad."
                            loading={actionLoading}
                        />
                    </Box>
                </Paper>
            </Stack>

            {/* Dialogo de Confirmación (sin cambios) */}
            <Dialog open={isConfirmOpen} onClose={() => setConfirmOpen(false)}>
                <DialogTitle>Confirmar Acción</DialogTitle>
                <DialogContent>
                    <DialogContentText>{getDialogText()}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmOpen(false)} disabled={actionLoading}>No</Button>
                    <Button onClick={handleConfirmAction} color="primary" autoFocus disabled={actionLoading}>
                        {actionLoading ? <CircularProgress size={22} /> : 'Sí, confirmar'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default SubscriptionsManagementPage;