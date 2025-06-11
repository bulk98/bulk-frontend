// src/pages/NotFoundPage.jsx
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Container, Typography, Paper } from '@mui/material';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';

const NotFoundPage = () => {
  return (
    <Container component="main" maxWidth="sm">
      <Paper 
        elevation={3}
        sx={{
          mt: { xs: 6, sm: 8 },
          p: { xs: 3, sm: 4 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          borderRadius: 2
        }}
      >
        <ReportProblemOutlinedIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
        
        <Typography 
          variant="h3" 
          component="h1" 
          sx={{ fontWeight: 'bold' }}
        >
          404
        </Typography>
        
        <Typography 
          variant="h5" 
          component="h2" 
          color="text.primary"
          sx={{ mb: 1.5 }}
        >
          Página No Encontrada
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Lo sentimos, la página que buscas no existe, ha sido movida o está temporalmente indisponible.
        </Typography>
        
        <Button
          component={RouterLink}
          to="/"
          variant="contained"
          size="large"
          color="primary"
        >
          Volver a la Página de Inicio
        </Button>
      </Paper>
    </Container>
  );
};

export default NotFoundPage;