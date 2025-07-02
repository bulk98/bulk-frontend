import React from 'react';
import { Box, Typography } from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';

const CommunityStats = () => {
    return (
        <Box sx={{ textAlign: 'center', color: 'text.secondary', py: 8 }}>
            <BarChartIcon sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h5" component="div" gutterBottom>
                Estadísticas Detalladas
            </Typography>
            <Typography>
                Esta sección está en construcción. Próximamente aquí podrás ver métricas avanzadas sobre tu comunidad.
            </Typography>
        </Box>
    );
};

export default CommunityStats;