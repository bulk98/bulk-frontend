// src/components/dashboard/EmptyDashboard.jsx
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Button, Paper } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import HubIcon from '@mui/icons-material/Hub'; // Un ícono representativo de "red" o "comunidad"

const EmptyDashboard = () => {
    return (
        <Paper 
            variant="outlined" 
            sx={{ 
                p: 4, 
                textAlign: 'center', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: 2 
            }}
        >
            <HubIcon sx={{ fontSize: 60, color: 'secondary.light' }} />
            <Typography variant="h5" component="h3" sx={{ fontWeight: 'bold' }}>
                Aún no has creado ninguna comunidad
            </Typography>
            <Typography color="text.secondary" sx={{ maxWidth: '450px', mb: 2 }}>
                ¡Da el primer paso para construir tu red! Crea tu primera comunidad para empezar a compartir contenido y conectar con tus miembros.
            </Typography>
            <Button
                component={RouterLink}
                to="/crear-comunidad"
                variant="contained"
                size="large"
                startIcon={<AddCircleOutlineIcon />}
            >
                Crear tu Primera Comunidad
            </Button>
        </Paper>
    );
};

export default EmptyDashboard;