// RUTA: src/pages/Register/RegisterLayout.jsx
import React from 'react';
import { Container, Paper, Box, Stepper, Step, StepLabel, Button, Typography, CircularProgress } from '@mui/material';

const steps = ['Info Personal', 'Usuario y Correo', 'Tipo de Cuenta', 'Contraseña'];

const RegisterLayout = ({ children, currentStep, onNextClick, onBackClick, isLastStep, isSubmitting }) => {
    return (
        <Container component="main" maxWidth="sm" sx={{ my: { xs: 3, md: 6 } }}>
            <Paper variant="elevation" elevation={4} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}>
                <Typography component="h1" variant="h4" align="center" gutterBottom>
                    Crear una Cuenta
                </Typography>
                <Stepper activeStep={currentStep - 1} sx={{ pt: 2, pb: 4 }}>
                    {steps.map((label) => (
                        <Step key={label}><StepLabel>{label}</StepLabel></Step>
                    ))}
                </Stepper>
                
                <Box sx={{ minHeight: 280, mt: 2 }}>
                    {children}
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                    {currentStep > 1 && (
                        <Button onClick={onBackClick} sx={{ mr: 1 }} disabled={isSubmitting}>
                            Atrás
                        </Button>
                    )}
                    <Button
                        // El botón "Finalizar" ahora es de tipo "submit" para que el formulario se envíe
                        type={isLastStep ? 'submit' : 'button'}
                        variant="contained"
                        onClick={isLastStep ? undefined : onNextClick} // El onClick solo se usa para "Siguiente"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? <CircularProgress size={24} /> : (isLastStep ? 'Finalizar Registro' : 'Siguiente')}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default RegisterLayout;