import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { getPlansForCommunity, createPlan, deletePlan } from '../../services/subscriptionPlanService';
import { Box, Typography, Button, TextField, Paper, Grid, CircularProgress, Alert, IconButton, Divider } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';

const SubscriptionPlansManager = ({ communityId }) => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

    const fetchPlans = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getPlansForCommunity(communityId);
            setPlans(response.data);
        } catch (err) {
            setError('No se pudieron cargar los planes.');
        } finally {
            setLoading(false);
        }
    }, [communityId]);

    useEffect(() => {
        fetchPlans();
    }, [fetchPlans]);

    const handleCreatePlan = async (data) => {
        try {
            await createPlan(communityId, data);
            reset();
            fetchPlans(); // Recargar la lista de planes
        } catch (err) {
            setError(err.response?.data?.error || 'Error al crear el plan.');
        }
    };

    const handleDeletePlan = async (planId) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este plan?')) {
            try {
                await deletePlan(planId);
                fetchPlans();
            } catch (err) {
                setError(err.response?.data?.error || 'Error al eliminar el plan.');
            }
        }
    };

    if (loading) return <CircularProgress />;

    return (
        <Box>
            <Typography variant="h5" gutterBottom>Planes de Suscripción</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Crea y gestiona los niveles de suscripción para tu comunidad. Los usuarios podrán elegir uno de estos planes para acceder a tu contenido premium.
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {/* Formulario para crear un nuevo plan */}
            <Paper component="form" onSubmit={handleSubmit(handleCreatePlan)} sx={{ p: 2, mb: 4 }} variant="outlined">
                <Typography variant="h6" sx={{ mb: 2 }}>Crear Nuevo Plan</Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Nombre del Plan (ej: Básico, VIP)" {...register("name", { required: "El nombre es obligatorio" })} error={!!errors.name} helperText={errors.name?.message} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth type="number" label="Precio (ej: 4.99)" {...register("price", { required: "El precio es obligatorio", valueAsNumber: true })} error={!!errors.price} helperText={errors.price?.message} />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField fullWidth multiline rows={3} label="Descripción y Beneficios" {...register("description")} />
                    </Grid>
                </Grid>
                <Button type="submit" variant="contained" sx={{ mt: 2 }} disabled={isSubmitting} startIcon={<AddCircleIcon />}>
                    {isSubmitting ? <CircularProgress size={24} /> : "Añadir Plan"}
                </Button>
            </Paper>

            <Divider sx={{ my: 3 }} />

            {/* Lista de planes existentes */}
            <Typography variant="h6" sx={{ mb: 2 }}>Planes Actuales</Typography>
            {plans.length > 0 ? (
                plans.map(plan => (
                    <Paper key={plan.id} sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} variant="outlined">
                        <Box>
                            <Typography variant="h6" component="div">{plan.name}</Typography>
                            <Typography color="primary.main" sx={{fontWeight: 'bold'}}>{plan.price} {plan.currency}/{plan.interval}</Typography>
                            <Typography variant="body2" color="text.secondary">{plan.description}</Typography>
                        </Box>
                        <IconButton onClick={() => handleDeletePlan(plan.id)} color="error">
                            <DeleteIcon />
                        </IconButton>
                    </Paper>
                ))
            ) : (
                <Typography>Aún no has creado ningún plan de suscripción.</Typography>
            )}
        </Box>
    );
};

export default SubscriptionPlansManager;