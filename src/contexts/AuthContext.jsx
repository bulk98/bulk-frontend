// src/contexts/AuthContext.jsx - VERSIÓN FINAL Y OPTIMIZADA
import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { loginUser as apiLoginUser } from '../services/authService';
import { getUserProfile } from '../services/userService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('authToken'));
    const [loadingAuth, setLoadingAuth] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('authUser');
        if (storedToken) {
            setToken(storedToken);
            if (storedUser) {
                try { 
                    setUser(JSON.parse(storedUser)); 
                } catch (e) {
                    console.error("Error al parsear usuario desde localStorage", e);
                    localStorage.removeItem('authUser');
                }
            }
        }
        setLoadingAuth(false);
    }, []);

    const login = useCallback(async (email, password) => {
        try {
            const responseData = await apiLoginUser(email, password);
            if (responseData && responseData.token) {
                localStorage.setItem('authToken', responseData.token);
                setToken(responseData.token);
                if (responseData.user) {
                    localStorage.setItem('authUser', JSON.stringify(responseData.user));
                    setUser(responseData.user);
                }
                return responseData.user || true;
            } else {
                throw new Error(responseData.message || 'Respuesta de login inválida.');
            }
        } catch (error) {
            console.error('Error en AuthContext login:', error);
            throw error;
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        setToken(null);
        setUser(null);
    }, []);

    const updateAuthUser = useCallback((updatedUserData) => {
        setUser(prevUser => {
            if (!prevUser) return updatedUserData;
            const newUser = { ...prevUser, ...updatedUserData };
            localStorage.setItem('authUser', JSON.stringify(newUser));
            return newUser;
        });
    }, []);

    const refreshAuthUserProfile = useCallback(async () => {
        const currentToken = localStorage.getItem('authToken');
        if (!currentToken) return null;
        try {
            const freshUserProfile = await getUserProfile();
            updateAuthUser(freshUserProfile);
            return freshUserProfile;
        } catch (error) {
            console.error("AuthContext: Error refrescando el perfil:", error);
            if (error.response && error.response.status === 401) {
                logout();
            }
            return null;
        }
    }, [updateAuthUser, logout]);

    // MEJORA CON useMemo: Previene re-renderizados innecesarios en toda la app.
    // El objeto 'value' del Provider solo se creará de nuevo si una de sus dependencias cambia.
    const contextValue = useMemo(() => ({
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token,
        loadingAuth,
        updateAuthUser,
        refreshAuthUserProfile
    }), [user, token, loadingAuth, login, logout, updateAuthUser, refreshAuthUserProfile]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};