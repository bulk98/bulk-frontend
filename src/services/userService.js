// src/services/userService.js
import api from './api';

export const getUserProfile = async () => {
    try {
        const response = await api.get('/me/profile');
        return response.data;
    } catch (error) {
        console.error('Error en el servicio getUserProfile:', error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error('Error al obtener el perfil del usuario.');
    }
};

export const updateUserProfile = async (dataToUpdate) => {
    try {
        const response = await api.put('/me/profile', dataToUpdate);
        return response.data.perfil;
    } catch (error) {
        console.error('Error en el servicio updateUserProfile:', error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error('Error al actualizar el perfil del usuario.');
    }
};

export const uploadUserAvatar = async (avatarFile) => {
    const formData = new FormData();
    formData.append('avatarImage', avatarFile);
    try {
        const response = await api.patch('/me/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data.perfil;
    } catch (error) {
        console.error('Error en el servicio uploadUserAvatar:', error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error('Error al subir el avatar.');
    }
};

export const deleteUserAvatar = async () => {
    try {
        const response = await api.delete('/me/avatar');
        return response.data.perfil;
    } catch (error) {
        console.error('Error en el servicio deleteUserAvatar:', error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error('Error al eliminar el avatar.');
    }
};

export const getGuruDashboardData = async () => {
    try {
        const response = await api.get('/me/dashboard');
        return response.data;
    } catch (error) {
        const errorMessage = error.response ? (error.response.data.message || error.response.data.error) : error.message;
        console.error('Error en el servicio getGuruDashboardData:', errorMessage);
        throw error.response ? (error.response.data || new Error(errorMessage)) : new Error(errorMessage || 'Error al obtener los datos del dashboard.');
    }
};

export const getUserFeed = async (page = 1, limit = 10) => {
    try {
        const response = await api.get('/me/feed', { params: { page, limit } });
        return response.data;
    } catch (error) {
        const errorMessage = error.response ? (error.response.data.message || error.response.data.error) : error.message;
        console.error('Error en el servicio getUserFeed:', errorMessage);
        throw error.response ? (error.response.data || new Error(errorMessage)) : new Error(errorMessage || 'Error al obtener el feed personalizado.');
    }
};

export const getPublicUserProfile = async (userId) => {
    try {
        const response = await api.get(`/users/${userId}/profile`);
        return response.data;
    } catch (error) {
        console.error(`Error en getPublicUserProfile para userId ${userId}:`, error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error('Error al obtener el perfil público.');
    }
};

export const getUserPosts = async (userId, page = 1, limit = 10) => {
    try {
        const response = await api.get(`/users/${userId}/posts`, {
            params: { page, limit }
        });
        return response.data;
    } catch (error) {
        console.error(`Error en getUserPosts para userId ${userId}:`, error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error('Error al obtener los posts del usuario.');
    }
};

export const getUserCommunities = async (userId) => {
    try {
        const response = await api.get(`/users/${userId}/communities`);
        return response.data;
    } catch (error) {
        console.error(`Error en getUserCommunities para userId ${userId}:`, error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error('Error al obtener las comunidades del usuario.');
    }
};

export const getManagementInfo = async () => {
    try {
        const response = await api.get('/me/management-info');
        return response.data;
    } catch (error) {
        console.error("Error fetching management info:", error);
        throw error.response ? error.response.data : new Error('Error al cargar la información de gestión.');
    }
};

export const changePassword = async (passwordData) => {
    try {
        const response = await api.patch('/me/change-password', passwordData);
        return response.data;
    } catch (error) {
        console.error("Error changing password:", error);
        // Lanza el error del backend para que el componente lo pueda mostrar
        throw error.response?.data || new Error('Error al cambiar la contraseña.');
    }
};