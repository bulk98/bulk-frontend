// src/pages/GuruDashboardPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getGuruDashboardData } from '../services/userService';
import DashboardBarChart from '../components/dashboard/DashboardBarChart';
import EmptyDashboard from '../components/dashboard/EmptyDashboard';

import { Container, Typography, Paper, Box, CircularProgress, Alert, Grid, Card, CardContent, CardActions, CardHeader, Button, Stack, Avatar } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import ArticleIcon from '@mui/icons-material/Article';
import StarIcon from '@mui/icons-material/Star';
import GroupsIcon from '@mui/icons-material/Groups';


const KpiCard = ({ title, value, icon }) => (
  <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', height: '100%' }}>
    <Box sx={{ mr: 2, color: 'primary.main' }}>
      {icon}
    </Box>
    <Box>
      <Typography variant="h6" sx={{fontWeight:'bold'}}>{value}</Typography>
      <Typography variant="body2" color="text.secondary">{title}</Typography>
    </Box>
  </Paper>
);

const GuruDashboardPage = () => {
    const navigate = useNavigate();
    const { user: authUser, isAuthenticated, loading: loadingAuth } = useAuth(); 

    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchDashboardData = useCallback(async () => {
        // Se quita la comprobación de rol de aquí, ya que se hace en el useEffect
        if (!isAuthenticated) return;
        setLoading(true);
        setError('');
        try {
            const data = await getGuruDashboardData();
            setDashboardData(data);
        } catch (err) {
            console.error("Error al cargar datos del dashboard GURÚ:", err);
            setError(err.message || "No se pudo cargar la información.");
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]); // Se simplifican dependencias

    useEffect(() => {
        if (loadingAuth) return; // Esperar a que la autenticación termine
        
        if (isAuthenticated) {
            // Se actualiza el nombre del rol a OG
            if (authUser?.tipo_usuario === 'OG') {
                fetchDashboardData();
            } else {
                // ===== CORRECCIÓN AQUÍ =====
                // Si el usuario no es OG, establecemos el error y quitamos el estado de carga.
                setError("Acceso denegado: Esta página es solo para OGs.");
                setLoading(false); 
            }
        } else {
            // Si no está autenticado, lo redirigimos
            navigate('/login');
        }
    }, [authUser, isAuthenticated, loadingAuth, fetchDashboardData, navigate]); // Dependencias actualizadas

    const processedData = useMemo(() => {
        if (!dashboardData || !dashboardData.managedCommunities) {
            return { kpis: {}, chartData: [] };
        }
        const communities = dashboardData.managedCommunities;
        const kpis = {
            totalMembers: communities.reduce((sum, c) => sum + (c.memberCount || 0), 0),
            totalPosts: communities.reduce((sum, c) => sum + (c.postCount || 0), 0),
            totalSubscribers: communities.reduce((sum, c) => sum + (c.premiumSubscribersCount || 0), 0)
        };
        const chartData = communities.map(c => ({
            name: c.name,
            Miembros: c.memberCount || 0,
        }));
        return { kpis, chartData };
    }, [dashboardData]);


    if (loadingAuth || loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}><CircularProgress /></Box>;
    }
    
    // Ahora, cuando un usuario no-OG acceda, 'loading' será false y 'error' tendrá un mensaje,
    // por lo que este bloque se renderizará correctamente.
    if (error) { 
        return <Container maxWidth="md" sx={{ textAlign: 'center', mt: 5 }}><Alert severity="error">{error}</Alert></Container>; 
    }
    
    if (!dashboardData) { 
        return <Container maxWidth="md" sx={{ textAlign: 'center', mt: 5 }}><Typography>No se encontraron datos del dashboard.</Typography></Container>; 
    }
    
    const { managedCommunities } = dashboardData;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Stack direction={{xs:'column', md:'row'}} justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                <Box>
                    <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>Panel de OG</Typography>
                    <Typography color="text.secondary">Bienvenido de nuevo, {authUser.name || authUser.email}.</Typography>
                </Box>
                <Button 
                    component={RouterLink} 
                    to="/crear-comunidad" 
                    variant="contained" 
                    size="large"
                    startIcon={<AddCircleOutlineIcon />}
                    sx={{mt: {xs: 2, md: 0}}}
                >
                    Crear Nueva Comunidad
                </Button>
            </Stack>

            {managedCommunities && managedCommunities.length > 0 ? (
                <>
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} sm={6} md={3}><KpiCard title="Comunidades Creadas" value={dashboardData.totalCommunitiesCreated ?? 0} icon={<GroupsIcon sx={{fontSize:40}}/>} /></Grid>
                        <Grid item xs={12} sm={6} md={3}><KpiCard title="Miembros Totales" value={processedData.kpis.totalMembers?.toLocaleString() ?? 0} icon={<PeopleAltIcon sx={{fontSize:40}}/>} /></Grid>
                        <Grid item xs={12} sm={6} md={3}><KpiCard title="Posts Totales" value={processedData.kpis.totalPosts?.toLocaleString() ?? 0} icon={<ArticleIcon sx={{fontSize:40}}/>} /></Grid>
                        <Grid item xs={12} sm={6} md={3}><KpiCard title="Suscriptores Premium" value={processedData.kpis.totalSubscribers?.toLocaleString() ?? 0} icon={<StarIcon sx={{fontSize:40}}/>} /></Grid>
                    </Grid>
                    
                    {processedData.chartData && processedData.chartData.length > 0 && (
                        <Box sx={{ mb: 4 }}>
                            <DashboardBarChart data={processedData.chartData} title="Comparativa de Miembros por Comunidad" xAxisKey="name" dataKey="Miembros" name="Miembros" />
                        </Box>
                    )}

                    <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight:'medium' }}>
                        Mis Comunidades Gestionadas
                    </Typography>
                    <Grid container spacing={3}>
                        {managedCommunities.map((community) => (
                            <Grid item xs={12} md={6} lg={4} key={community.id}>
                                <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 4 } }}>
                                    <CardHeader
                                        avatar={ <Avatar variant="rounded" src={community.logoUrl || undefined} alt={`Logo de ${community.name}`}>{!community.logoUrl && community.name.charAt(0)}</Avatar> }
                                        titleTypographyProps={{ noWrap: true, fontWeight: 'bold', variant: 'h6' }}
                                        title={community.name}
                                    />
                                    <CardContent sx={{ flexGrow: 1, pt:0 }}>
                                        <Stack spacing={0.5}>
                                            <Typography variant="body2" color="text.secondary">Miembros: <b>{community.memberCount ?? 0}</b></Typography>
                                            <Typography variant="body2" color="text.secondary">Posts: <b>{community.postCount ?? 0}</b></Typography>
                                            <Typography variant="body2" color="text.secondary">Suscriptores: <b>{community.premiumSubscribersCount ?? 0}</b></Typography>
                                        </Stack>
                                    </CardContent>
                                    <CardActions sx={{ justifyContent: 'flex-end', p:2, pt: 1 }}>
                                        <Button component={RouterLink} to={`/comunidades/${community.id}`} size="small">Ver</Button>
                                        <Button component={RouterLink} to={`/comunidades/${community.id}/editar`} size="small" variant="contained" color="secondary">Gestionar</Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </>
            ) : (
                <EmptyDashboard />
            )}
        </Container>
    );
};

export default GuruDashboardPage;