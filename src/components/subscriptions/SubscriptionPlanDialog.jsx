import React, { useState, useEffect } from 'react';
import { getPublicCommunityPlans } from '../../services/communityService';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Box,
    CircularProgress, Alert, Paper, Typography, Radio, List, ListItem,
    ListItemText, ListItemIcon
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';

const SubscriptionPlanDialog = ({ open, onClose, communityId, communityName }) => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedPlanId, setSelectedPlanId] = useState('');

    useEffect(() => {
        if (open) {
            setLoading(true);
            setError('');
            getPublicCommunityPlans(communityId)
                .then(data => {
                    setPlans(data);
                    // Seleccionar el primer plan por defecto
                    if (data.length > 0) {
                        setSelectedPlanId(data[0].id);
                    }
                })
                .catch(err => setError('No se pudieron cargar los planes.'))
                .finally(() => setLoading(false));
        }
    }, [open, communityId]);

    const handleSelectPlan = () => {
        // Por ahora, solo cerramos el diálogo.
        // En el futuro, esta función iniciará el proceso de pago con el 'selectedPlanId'.
        console.log(`Plan seleccionado: ${selectedPlanId}`);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Suscripción Premium para {communityName}</DialogTitle>
            <DialogContent>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>
                ) : error ? (
                    <Alert severity="error">{error}</Alert>
                ) : plans.length > 0 ? (
                    <List>
                        <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>Selecciona un plan para continuar:</Typography>
                        {plans.map(plan => (
                            <Paper
                                key={plan.id}
                                variant="outlined"
                                sx={{ mb: 2, borderRadius: 2, cursor: 'pointer', borderColor: selectedPlanId === plan.id ? 'primary.main' : 'divider' }}
                                onClick={() => setSelectedPlanId(plan.id)}
                            >
                                <ListItem>
                                    <ListItemIcon>
                                        <Radio
                                            checked={selectedPlanId === plan.id}
                                            onChange={() => setSelectedPlanId(plan.id)}
                                            value={plan.id}
                                            name="subscription-plan-radio"
                                        />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Typography variant="h6" component="div">
                                                {plan.name} - ${plan.price} <Typography variant="caption" color="text.secondary">/{plan.currency}</Typography>
                                            </Typography>
                                        }
                                        secondary={plan.description}
                                    />
                                </ListItem>
                            </Paper>
                        ))}
                    </List>
                ) : (
                    <Alert severity="info">Esta comunidad aún no ha configurado planes de suscripción.</Alert>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button 
                    onClick={handleSelectPlan} 
                    variant="contained"
                    disabled={!selectedPlanId || plans.length === 0}
                    startIcon={<StarIcon />}
                >
                    Continuar a Suscripción
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default SubscriptionPlanDialog;