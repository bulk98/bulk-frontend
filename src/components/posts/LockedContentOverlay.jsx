// RUTA: src/components/posts/LockedContentOverlay.jsx

import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';

const LockedContentOverlay = ({ onSubscribeClick }) => {
    return (
        <Box
            sx={{
                position: 'relative',
                height: 200, // Ajusta esta altura según el diseño de tu tarjeta
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.08)', // Un fondo sutil
                borderRadius: 1.5,
                p: 2,
                border: '1px dashed',
                borderColor: 'divider'
            }}
        >
            <LockIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                Contenido Premium
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                Suscríbete para desbloquear este y todos los posts premium de la comunidad.
            </Typography>
            <Button variant="contained" onClick={onSubscribeClick}>
                Suscribirse para ver
            </Button>
        </Box>
    );
};

export default LockedContentOverlay;