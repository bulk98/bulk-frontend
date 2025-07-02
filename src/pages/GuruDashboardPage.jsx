// src/pages/GuruDashboardPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
// MODIFICADO: Se importa el nuevo servicio para la gráfica
import { getGuruDashboardData } from '../services/userService';
import { getCommunityGrowthStats } from '../services/communityService'; 
import DashboardBarChart from '../components/dashboard/DashboardBarChart';
import EmptyDashboard from '../components/dashboard/EmptyDashboard';
// NUEVO: Se importa el componente de la gráfica de líneas y los componentes de Acordeón
import GrowthChart from '../components/dashboard/GrowthChart';
import { 
    Container, Typography, Paper, Box, CircularProgress, Alert, Grid, Card, CardContent, 
    CardActions, CardHeader, Button, Stack, Avatar, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import ArticleIcon from '@mui/icons-material/Article';
import StarIcon from '@mui/icons-material/Star';
import GroupsIcon from '@mui/icons-material/Groups';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'; // Ícono para el acordeón

const KpiCard = ({ title, value, icon }) => (
    <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', height: '100%' }}>
        <Box sx={{ mr: 2, color: 'primary.main' }}>{icon}</Box>
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
    
    // ===== INICIO DE LA MODIFICACIÓN =====
    // Nuevo estado para almacenar los datos de las gráficas de crecimiento de cada comunidad
    const [chartsData, setChartsData] = useState({});
    // Estado para saber qué gráfica se está cargando
    const [loadingChart, setLoadingChart] = useState(null);
    // ===== FIN DE LA MODIFICACIÓN =====

    const fetchDashboardData = useCallback(async () => {
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
    }, [isAuthenticated]);

    useEffect(() => {
        if (loadingAuth) return;
        if (isAuthenticated) {
            if (authUser?.tipo_usuario === 'OG') {
                fetchDashboardData();
            } else {
                setError("Acceso denegado: Esta página es solo para OGs.");
                setLoading(false); 
            }
        } else {
            navigate('/login');
        }
    }, [authUser, isAuthenticated, loadingAuth, fetchDashboardData, navigate]);

    // ===== INICIO DE LA MODIFICACIÓN =====
    // Función que se llama al expandir un acordeón para cargar los datos de la gráfica
    const handleFetchChartData = useCallback(async (communityId) => {
        // Si ya tenemos los datos, o si ya se están cargando, no hacer nada
        if (chartsData[communityId] || loadingChart === communityId) return;

        setLoadingChart(communityId); // Indicamos que esta gráfica está cargando
        try {
            const stats = await getCommunityGrowthStats(communityId);
            setChartsData(prev => ({ ...prev, [communityId]: stats }));
        } catch (err) {
            console.error(`Error al cargar datos de gráfica para comunidad ${communityId}`, err);
            // Guardamos un estado de error para esa gráfica específica
            setChartsData(prev => ({ ...prev, [communityId]: { error: true, message: err.message } }));
        } finally {
            setLoadingChart(null); // Dejamos de cargar
        }
    }, [chartsData, loadingChart]);
    // ===== FIN DE LA MODIFICACIÓN =====

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
                <Button component={RouterLink} to="/crear-comunidad" variant="contained" size="large" startIcon={<AddCircleOutlineIcon />} sx={{mt: {xs: 2, md: 0}}}>
                    Crear Nueva Comunidad
                </Button>
            </Stack>

            {managedCommunities && managedCommunities.length > 0 ? (
                <>
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        {/* ... (Tus KpiCards sin cambios) ... */}
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
                            <Grid item xs={12} md={6} key={community.id}>
                                <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                                    <CardHeader
                                        avatar={ <Avatar variant="rounded" src={community.logoUrl || undefined}>{!community.logoUrl && community.name.charAt(0)}</Avatar> }
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
                                    
                                    {/* ===== INICIO DE LA MODIFICACIÓN ===== */}
                                    {/* Se añade un Acordeón para la gráfica de crecimiento */}
                                    <Accordion sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}>
                                        <AccordionSummary expandIcon={<ExpandMoreIcon />} onClick={() => handleFetchChartData(community.id)}>
                                            <Typography variant="body2" color="primary">Ver crecimiento</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            {loadingChart === community.id ? (
                                                <CircularProgress size={24} />
                                            ) : chartsData[community.id] && !chartsData[community.id].error ? (
                                                <GrowthChart 
                                                    data={chartsData[community.id]} 
                                                    dataKey="Miembros" 
                                                    title="Miembros a lo largo del tiempo" 
                                                />
                                            ) : (
                                                <Typography color="error.main">No se pudieron cargar los datos.</Typography>
                                            )}
                                        </AccordionDetails>
                                    </Accordion>
                                    {/* ===== FIN DE LA MODIFICACIÓN ===== */}
                                    
                                    <CardActions sx={{ justifyContent: 'flex-end', p:2, pt: 1, borderTop: 1, borderColor: 'divider' }}>
                                        <Button component={RouterLink} to={`/comunidades/${community.id}`} size="small">Ver</Button>
                                        <Button component={RouterLink} to={`/comunidades/${community.id}/gestionar`} size="small" variant="contained" color="secondary">Gestionar</Button>
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