// src/components/layout/MainLayout.jsx
import React from 'react';
import Navbar from './Navbar';
import { Box, Container } from '@mui/material';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
  return (
    <>
      <Navbar />
      <Container maxWidth="lg">
        <Box component="main" sx={{ py: 3 }}>
          <Outlet />
        </Box>
      </Container>
    </>
  );
};

export default MainLayout;
