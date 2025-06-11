// src/services/subscriptionService.js
import api from './api';

/**
 * Suscribe al usuario autenticado al contenido premium de una comunidad.
 * @param {string} communityId - El ID de la comunidad a la que suscribirse.
 * @returns {Promise<object>} - La respuesta del backend.
 */
export const subscribeToCommunityPremium = async (communityId) => {
    try {
        // El interceptor se encargará de añadir el token de autenticación.
        const response = await api.post(`/communities/${communityId}/suscripcion`, {});
        return response.data;
    } catch (error) {
        const errorMessage = error.response 
            ? (error.response.data.message || error.response.data.error || JSON.stringify(error.response.data)) 
            : error.message;
        console.error(`Error en servicio subscribeToCommunityPremium para communityId ${communityId}:`, errorMessage);
        throw error.response ? (error.response.data || new Error(errorMessage)) : new Error(errorMessage || 'Error al procesar la suscripción.');
    }
};

/**
 * Cancela la suscripción del usuario autenticado al contenido premium de una comunidad.
 * @param {string} communityId - El ID de la comunidad de la que cancelar la suscripción.
 * @returns {Promise<object>} - La respuesta del backend.
 */
export const unsubscribeFromCommunityPremium = async (communityId) => {
    try {
        // El interceptor se encargará de añadir el token de autenticación.
        const response = await api.delete(`/communities/${communityId}/suscripcion`);
        return response.data;
    } catch (error) {
        const errorMessage = error.response 
            ? (error.response.data.message || error.response.data.error || JSON.stringify(error.response.data)) 
            : error.message;
        console.error(`Error en servicio unsubscribeFromCommunityPremium para communityId ${communityId}:`, errorMessage);
        throw error.response ? (error.response.data || new Error(errorMessage)) : new Error(errorMessage || 'Error al cancelar la suscripción.');
    }
};