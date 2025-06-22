// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { loginUser as apiLoginUser } from '../services/authService';
import { getUserProfile } from '../services/userService';
// NUEVO: Se importa el servicio de notificaciones
import { getNotifications } from '../services/notificationService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('authToken'));
    const [loadingAuth, setLoadingAuth] = useState(true);
    
    // ===== INICIO DE LA MODIFICACIÓN (NUEVOS ESTADOS) =====
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    // ===== FIN DE LA MODIFICACIÓN =====

    // ===== INICIO DE LA MODIFICACIÓN (NUEVA FUNCIÓN) =====
    // Función para obtener las notificaciones del backend y actualizar el estado
    const fetchNotifications = useCallback(async () => {
        // Solo intentar obtener notificaciones si hay un token
        if (!localStorage.getItem('authToken')) return;
        try {
            const data = await getNotifications();
            setNotifications(data.notifications || []);
            setUnreadCount(data.unreadCount || 0);
        } catch (error) {
            console.error("AuthContext: Fallo al obtener notificaciones", error);
            // Opcional: podrías limpiar las notificaciones si hay un error de autenticación
            // setNotifications([]);
            // setUnreadCount(0);
        }
    }, []);
    // ===== FIN DE LA MODIFICACIÓN =====

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

    // ===== INICIO DE LA MODIFICACIÓN (Se añade fetchNotifications) =====
    // Se modifica la función de login para que también cargue las notificaciones
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
                await fetchNotifications(); // Cargar notificaciones justo después del login
                return responseData.user || true;
            } else {
                throw new Error(responseData.message || 'Respuesta de login inválida.');
            }
        } catch (error) {
            console.error('Error en AuthContext login:', error);
            throw error;
        }
    }, [fetchNotifications]); // Se añade la dependencia
    // ===== FIN DE LA MODIFICACIÓN =====

    // ===== INICIO DE LA MODIFICACIÓN (Limpiar notificaciones al salir) =====
    const logout = useCallback(() => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        setToken(null);
        setUser(null);
        setNotifications([]); // Limpiar notificaciones
        setUnreadCount(0);  // Resetear contador
    }, []);
    // ===== FIN DE LA MODIFICACIÓN =====

    const updateAuthUser = useCallback((updatedUserData) => {
        setUser(prevUser => {
            if (!prevUser) return updatedUserData;
            const newUser = { ...prevUser, ...updatedUserData };
            localStorage.setItem('authUser', JSON.stringify(newUser));
            return newUser;
        });
    }, []);
    
    // Se mantiene la función para refrescar el perfil de usuario
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

    // ===== INICIO DE LA MODIFICACIÓN (Añadir un useEffect para refrescar notificaciones) =====
    // Este efecto se ejecutará una vez cuando el componente se monte,
    // y luego periódicamente para mantener las notificaciones actualizadas.
    useEffect(() => {
        if (token) {
            fetchNotifications(); // Carga inicial
            const intervalId = setInterval(fetchNotifications, 60000); // Refresca cada 60 segundos
            return () => clearInterval(intervalId); // Limpia el intervalo al desmontar
        }
    }, [token, fetchNotifications]);
    // ===== FIN DE LA MODIFICACIÓN =====

    const contextValue = useMemo(() => ({
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token,
        loadingAuth,
        updateAuthUser,
        refreshAuthUserProfile,
        // ===== INICIO DE LA MODIFICACIÓN (Se exponen los nuevos valores) =====
        notifications,
        unreadCount,
        fetchNotifications
        // ===== FIN DE LA MODIFICACIÓN =====
    }), [user, token, loadingAuth, login, logout, updateAuthUser, refreshAuthUserProfile, notifications, unreadCount, fetchNotifications]); // Se añaden las dependencias

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