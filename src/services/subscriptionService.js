// RUTA: src/services/subscriptionService.js

import api from './api';

export const subscribeToCommunityPremium = async (communityId) => {
    try {
        const response = await api.post(`/communities/${communityId}/suscripcion`);
        return response.data;
    } catch (error) {
        console.error(`Error en servicio subscribeToCommunityPremium para communityId ${communityId}:`, error.response?.data || error.message);
        throw error.response?.data || new Error('Error al procesar la suscripción.');
    }
};

export const unsubscribeFromCommunityPremium = async (communityId) => {
    try {
        const response = await api.delete(`/communities/${communityId}/suscripcion`);
        return response.data;
    } catch (error) {
        console.error(`Error en servicio unsubscribeFromCommunityPremium para communityId ${communityId}:`, error.response?.data || error.message);
        throw error.response?.data || new Error('Error al cancelar la suscripción.');
    }
};