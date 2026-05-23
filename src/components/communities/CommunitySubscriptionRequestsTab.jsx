import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    Alert,
    Avatar,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Snackbar,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    Chip,
    Paper
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import {
    approveSubscriptionRequest,
    getPendingSubscriptionRequests,
    rejectSubscriptionRequest
} from '../../services/communityService';

const formatDate = (value) => {
    if (!value) return '-';
    return new Date(value).toLocaleString();
};

const CommunitySubscriptionRequestsTab = () => {
    const { communityId } = useParams();

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoadingId, setActionLoadingId] = useState(null);
    const [error, setError] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '' });

    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [requestToReject, setRequestToReject] = useState(null);
    const [adminNote, setAdminNote] = useState('');

    const fetchRequests = useCallback(async () => {
        if (!communityId) return;

        setLoading(true);
        setError('');

        try {
            const data = await getPendingSubscriptionRequests(communityId);
            setRequests(data.requests || []);
        } catch (err) {
            setError(err.message || err.error || 'No se pudieron cargar las solicitudes.');
        } finally {
            setLoading(false);
        }
    }, [communityId]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleApprove = async (subscriptionId) => {
        setActionLoadingId(subscriptionId);

        try {
            const response = await approveSubscriptionRequest(communityId, subscriptionId);
            setSnackbar({ open: true, message: response.mensaje || 'Solicitud aprobada.' });
            await fetchRequests();
        } catch (err) {
            setSnackbar({ open: true, message: err.message || err.error || 'No se pudo aprobar la solicitud.' });
        } finally {
            setActionLoadingId(null);
        }
    };

    const openRejectDialog = (request) => {
        setRequestToReject(request);
        setAdminNote('');
        setRejectDialogOpen(true);
    };

    const closeRejectDialog = () => {
        if (actionLoadingId) return;
        setRejectDialogOpen(false);
        setRequestToReject(null);
        setAdminNote('');
    };

    const handleReject = async () => {
        if (!requestToReject) return;

        setActionLoadingId(requestToReject.id);

        try {
            const response = await rejectSubscriptionRequest(communityId, requestToReject.id, adminNote);
            setSnackbar({ open: true, message: response.mensaje || 'Solicitud rechazada.' });
            closeRejectDialog();
            await fetchRequests();
        } catch (err) {
            setSnackbar({ open: true, message: err.message || err.error || 'No se pudo rechazar la solicitud.' });
        } finally {
            setActionLoadingId(null);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Stack spacing={1} sx={{ mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    Solicitudes premium pendientes
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Revisa los pagos manuales reportados por los CREW antes de activar el acceso premium.
                </Typography>
            </Stack>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {!error && requests.length === 0 && (
                <Alert severity="info">
                    No hay solicitudes premium pendientes en esta comunidad.
                </Alert>
            )}

            {requests.length > 0 && (
                <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Usuario</TableCell>
                                <TableCell>Método</TableCell>
                                <TableCell>Referencia</TableCell>
                                <TableCell>Mensaje</TableCell>
                                <TableCell>Fecha solicitud</TableCell>
                                <TableCell align="right">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {requests.map((request) => {
                                const subscriber = request.subscriber || {};
                                const isProcessing = actionLoadingId === request.id;

                                return (
                                    <TableRow key={request.id}>
                                        <TableCell>
                                            <Stack direction="row" spacing={1.5} alignItems="center">
                                                <Avatar src={subscriber.avatarUrl || ''}>
                                                    {(subscriber.name || subscriber.username || 'U').charAt(0).toUpperCase()}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                        {subscriber.name || 'Usuario sin nombre'}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {subscriber.username ? `@${subscriber.username}` : subscriber.email || 'Sin username'}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </TableCell>

                                        <TableCell>
                                            {request.paymentMethod ? (
                                                <Chip size="small" label={request.paymentMethod} color="primary" variant="outlined" />
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">No indicado</Typography>
                                            )}
                                        </TableCell>

                                        <TableCell>
                                            <Typography variant="body2" sx={{ maxWidth: 180, wordBreak: 'break-word' }}>
                                                {request.paymentReference || '-'}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            <Typography variant="body2" sx={{ maxWidth: 220, whiteSpace: 'pre-wrap' }}>
                                                {request.userMessage || '-'}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            <Typography variant="body2">
                                                {formatDate(request.requestedAt)}
                                            </Typography>
                                        </TableCell>

                                        <TableCell align="right">
                                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                <Button
                                                    size="small"
                                                    variant="contained"
                                                    color="success"
                                                    startIcon={isProcessing ? <CircularProgress size={16} /> : <CheckCircleIcon />}
                                                    disabled={!!actionLoadingId}
                                                    onClick={() => handleApprove(request.id)}
                                                >
                                                    Aprobar
                                                </Button>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    color="error"
                                                    startIcon={<CancelIcon />}
                                                    disabled={!!actionLoadingId}
                                                    onClick={() => openRejectDialog(request)}
                                                >
                                                    Rechazar
                                                </Button>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Dialog open={rejectDialogOpen} onClose={closeRejectDialog} fullWidth maxWidth="sm">
                <DialogTitle>Rechazar solicitud</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            Puedes dejar una nota interna para recordar por qué fue rechazada.
                        </Typography>
                        <TextField
                            label="Nota del OG"
                            value={adminNote}
                            onChange={(event) => setAdminNote(event.target.value)}
                            multiline
                            minRows={3}
                            fullWidth
                            inputProps={{ maxLength: 500 }}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeRejectDialog} disabled={!!actionLoadingId}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleReject}
                        variant="contained"
                        color="error"
                        disabled={!!actionLoadingId}
                    >
                        {actionLoadingId ? <CircularProgress size={22} /> : 'Rechazar'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                message={snackbar.message}
            />
        </Box>
    );
};

export default CommunitySubscriptionRequestsTab;