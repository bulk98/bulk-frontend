import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import GrainIcon from '@mui/icons-material/Grain'; // Un ícono para la marca

const PublicNavbar = () => {
    return (
        <AppBar 
            position="static" 
            color="transparent" 
            elevation={0} 
            sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.8)', // Fondo ligeramente traslúcido
                backdropFilter: 'blur(10px)', // Efecto "glassmorphism"
                borderBottom: (theme) => `1px solid ${theme.palette.divider}`
            }}
        >
            <Toolbar sx={{ flexWrap: 'wrap' }}>
                <GrainIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography 
                    variant="h6" 
                    component={RouterLink} 
                    to="/" 
                    sx={{ flexGrow: 1, textDecoration: 'none', color: 'text.primary', fontWeight: 'bold' }}
                >
                    Bulk
                </Typography>
                <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                    <Button color="inherit" sx={{ mx: 0.5 }}>Características</Button>
                    <Button color="inherit" sx={{ mx: 0.5 }}>Para Creadores</Button>
                    <Button color="inherit" sx={{ mx: 0.5 }}>Precios</Button>
                </Box>
                <Box sx={{ flexGrow: { xs: 1, md: 0 } }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: { xs: 1, sm: 0 } }}>
                    <Button 
                        component={RouterLink} 
                        to="/login" 
                        variant="outlined"
                    >
                        Iniciar Sesión
                    </Button>
                    <Button 
                        component={RouterLink} 
                        to="/register" 
                        variant="contained"
                    >
                        Registrarse
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default PublicNavbar;