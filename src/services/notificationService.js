import api from './api';

/**
 * Obtiene las notificaciones y el conteo de no leídas para el usuario logueado.
 * @returns {Promise<Object>} Un objeto con { notifications: Array, unreadCount: Number }
 */
export const getNotifications = async () => {
    try {
        const response = await api.get('/notifications');
        return response.data;
    } catch (error) {
        console.error("Error fetching notifications:", error);
        throw error.response?.data || new Error('No se pudo obtener las notificaciones.');
    }
};

/**
 * Marca un conjunto de notificaciones como leídas.
 * @param {string[]} notificationIds - Un array de IDs de notificaciones a marcar como leídas.
 * @returns {Promise<Object>} La respuesta del servidor.
 */
export const markNotificationsAsRead = async (notificationIds) => {
    try {
        const response = await api.post('/notifications/mark-as-read', { notificationIds });
        return response.data;
    } catch (error) {
        console.error("Error marking notifications as read:", error);
        throw error.response?.data || new Error('No se pudo actualizar el estado de las notificaciones.');
    }
};