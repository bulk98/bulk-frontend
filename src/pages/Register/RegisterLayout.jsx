// src/pages/Register/RegisterLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { RegistrationProvider } from '../../contexts/RegistrationContext';
import { Container } from '@mui/material';

const RegisterLayout = () => {
  return (
    // Envolvemos todo el flujo en el Provider para compartir el estado
    <RegistrationProvider>
      <Container component="main" maxWidth="sm" sx={{ mt: { xs: 4, sm: 8 }, mb: 4 }}>
        <Outlet />
      </Container>
    </RegistrationProvider>
  );
};

export default RegisterLayout;