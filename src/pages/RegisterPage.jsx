// RUTA: src/pages/RegisterPage.jsx

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/authService';
import { Alert, Container, Paper, Box, Stepper, Step, StepLabel, Button, Typography, CircularProgress } from '@mui/material';

// Importación de los componentes de cada paso
import Step1PersonalInfo from './Register/Step1_PersonalInfo';
import Step2Username from './Register/Step2_Username';
import Step3UserType from './Register/Step3_UserType';
import Step4Password from './Register/Step4_Password';

const steps = ['Info Personal', 'Usuario y Correo', 'Tipo de Cuenta', 'Contraseña'];

const RegisterPage = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [serverError, setServerError] = useState('');
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        control,
        trigger,
        getValues,
    } = useForm({
        mode: 'onBlur',
        defaultValues: {
            name: '',
            fechaDeNacimiento: '',
            paisDeNacimiento: null,
            username: '',
            email: '',
            tipo_usuario: 'CREW',
            password: '',
            confirmPassword: '',
            // --- CAMPOS NUEVOS AÑADIDOS ---
            domicilio: '',
            celular: '',
        }
    });

    const handleNext = async () => {
        const fieldsByStep = {
            // --- CAMPOS NUEVOS AÑADIDOS A LA VALIDACIÓN DEL PASO 1 ---
            1: ['name', 'fechaDeNacimiento', 'paisDeNacimiento', 'domicilio', 'celular'],
            2: ['username', 'email'],
            3: ['tipo_usuario'],
        };
        
        const fieldsToValidate = fieldsByStep[currentStep] || [];
        const isValidStep = await trigger(fieldsToValidate);

        if (isValidStep) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleBack = () => setCurrentStep(prev => prev - 1);

    const onFinalSubmit = async (data) => {
        setServerError('');
        try {
            // ===== INICIO DE LA MODIFICACIÓN =====
            // Se elimina 'confirmPassword' del objeto antes de enviarlo,
            // ya que no existe en la base de datos.
            const { confirmPassword, ...dataToSend } = data;

            if (dataToSend.fechaDeNacimiento) {
                dataToSend.fechaDeNacimiento = new Date(dataToSend.fechaDeNacimiento).toISOString();
            } else {
                delete dataToSend.fechaDeNacimiento;
            }

            // Enviamos el objeto 'dataToSend' que ya no contiene 'confirmPassword'.
            await registerUser(dataToSend);
            // ===== FIN DE LA MODIFICACIÓN =====

            navigate('/please-verify', { state: { email: data.email } });
        } catch (error) {
            setServerError(error.response?.data?.error || error.message || 'Error en el registro. El usuario o correo puede que ya existan.');
        }
    };

    const renderStepContent = () => {
        const stepProps = { register, errors, control, getValues };
        switch (currentStep) {
            case 1: return <Step1PersonalInfo {...stepProps} />;
            case 2: return <Step2Username {...stepProps} />;
            case 3: return <Step3UserType {...stepProps} />;
            case 4: return <Step4Password {...stepProps} />;
            default: return null;
        }
    };
    
    const isLastStep = currentStep === steps.length;
    
    return (
        <form onSubmit={handleSubmit(onFinalSubmit)}>
            <Container component="main" maxWidth="sm" sx={{ my: { xs: 3, md: 6 } }}>
                <Paper component="div" variant="elevation" elevation={4} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}>
                    <Typography component="h1" variant="h4" align="center" gutterBottom>
                        Crear una Cuenta
                    </Typography>
                    <Stepper activeStep={currentStep - 1} sx={{ pt: 2, pb: 4 }}>
                        {steps.map((label) => (
                            <Step key={label}><StepLabel>{label}</StepLabel></Step>
                        ))}
                    </Stepper>
                    
                    <Box sx={{ minHeight: 350, mt: 2 }}>
                        {serverError && <Alert severity="error" sx={{mb: 2}}>{serverError}</Alert>}
                        {renderStepContent()}
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                        {currentStep > 1 && (
                            <Button onClick={handleBack} sx={{ mr: 1 }} disabled={isSubmitting}>
                                Atrás
                            </Button>
                        )}
                        {isLastStep ? (
                             <Button type="submit" variant="contained" disabled={isSubmitting}>
                                {isSubmitting ? <CircularProgress size={24} /> : 'Finalizar Registro'}
                            </Button>
                        ) : (
                            <Button variant="contained" type="button" onClick={handleNext}>
                                Siguiente
                            </Button>
                        )}
                    </Box>
                </Paper>
            </Container>
        </form>
    );
};

export default RegisterPage;