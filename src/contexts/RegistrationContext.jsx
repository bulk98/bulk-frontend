// src/contexts/RegistrationContext.jsx
import React, { createContext, useState, useContext, useMemo } from 'react';

const RegistrationContext = createContext();

export const RegistrationProvider = ({ children }) => {
    const [registrationData, setRegistrationData] = useState({
        // Step 1
        email: '',
        name: '',
        fechaDeNacimiento: '',
        paisDeNacimiento: '',
        ciudadDeNacimiento: '',
        domicilio: '',
        celular: '',
        // Step 2
        username: '',
        // Step 3
        tipo_usuario: 'CREW', // Valor por defecto
        // Step 4
        password: '',
        // Step 5 (Bio se puede añadir en el perfil después)
        bio: '',
    });

    const updateRegistrationData = (newData) => {
        setRegistrationData(prevData => ({ ...prevData, ...newData }));
    };

    const contextValue = useMemo(() => ({
        registrationData,
        updateRegistrationData
    }), [registrationData]);

    return (
        <RegistrationContext.Provider value={contextValue}>
            {children}
        </RegistrationContext.Provider>
    );
};

export const useRegistration = () => {
    const context = useContext(RegistrationContext);
    if (!context) {
        throw new Error('useRegistration debe ser usado dentro de un RegistrationProvider');
    }
    return context;
};