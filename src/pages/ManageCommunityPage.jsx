import React from 'react';
import { Outlet, Link as RouterLink, useLocation, useParams } from 'react-router-dom';
import { Box, Container, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Grid, styled, Paper } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import StarIcon from '@mui/icons-material/Star';
import BarChartIcon from '@mui/icons-material/BarChart';
import EditIcon from '@mui/icons-material/Edit';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

// ===== INICIO DE LA MODIFICACIÓN =====
// Se reordena el menú para poner "Editar" primero.
const menuItems = [
    { text: 'Editar Info/Imágenes', path: 'editar-info', icon: <EditIcon /> },
    { text: 'Planes y Precios', path: 'plans', icon: <AttachMoneyIcon /> },
    { text: 'Miembros', path: 'members', icon: <PeopleIcon /> },
    { text: 'Suscriptores', path: 'subscribers', icon: <StarIcon /> },
    { text: 'Estadísticas', path: 'stats', icon: <BarChartIcon /> },
];
// ===== FIN DE LA MODIFICACIÓN =====

// Estilo para el menú lateral
const Sidebar = styled(Box)(({ theme }) => ({
    // backgroundColor: theme.palette.grey['200'], // Un fondo muy claro si quieres destacar más
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    marginRight: theme.spacing(3),
}));

// Estilo para el contenedor del contenido principal
const Content = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    minHeight: '60vh',
}));

const ManageCommunityPage = () => {
    const location = useLocation();
    const { communityId } = useParams();

    const getActivePath = () => {
        const pathParts = location.pathname.split('/');
        const lastPart = pathParts.length > 0 ? pathParts.pop() : '';
        return lastPart;
    };

    return (
        <Container maxWidth="lg" sx={{ my: 4 }}>
            <Typography variant="h4" gutterBottom>Panel de Gestión</Typography>
            <Grid container spacing={3}>
                {/* Menú Lateral */}
                <Grid item xs={12} md={3}>
                    <Sidebar>
                        <List disablePadding>
                            {menuItems.map((item) => {
                                let toPath = `/comunidades/${communityId}/gestionar/${item.path}`;
                                if (item.path === 'edit') {
                                    toPath = `/comunidades/${communityId}/editar-info`;
                                }
                                return (
                                    <ListItem key={item.path} disablePadding>
                                        <ListItemButton
                                            component={RouterLink}
                                            to={toPath}
                                            selected={getActivePath() === item.path.toLowerCase()} // Comparación en minúsculas
                                            sx={{
                                                '&.Mui-selected': {
                                                    backgroundColor: (theme) => theme.palette.primary.light,
                                                    '& .MuiListItemIcon-root': {
                                                        color: (theme) => theme.palette.primary.main,
                                                    },
                                                },
                                                '&:hover': {
                                                    backgroundColor: (theme) => theme.palette.action.hover,
                                                },
                                            }}
                                        >
                                            <ListItemIcon>{item.icon}</ListItemIcon>
                                            <ListItemText primary={item.text} />
                                        </ListItemButton>
                                    </ListItem>
                                );
                            })}
                        </List>
                    </Sidebar>
                </Grid>

                {/* Área de Contenido Principal */}
                <Grid item xs={12} md={9}>
                    <Content variant="outlined">
                        {/* Outlet renderizará aquí el componente de la ruta hija activa */}
                        <Outlet />
                    </Content>
                </Grid>
            </Grid>
        </Container>
    );
};

export default ManageCommunityPage;