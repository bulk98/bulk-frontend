// src/services/communityService.js
import api from './api';

export const getPublicCommunities = async (page = 1, limit = 12, searchTerm = '', sortBy = 'members_desc') => {
    try {
        const response = await api.get('/communities', {
            params: { page, limit, search: searchTerm, sort: sortBy }
        });
        return response.data;
    } catch (error) {
        console.error('Error en el servicio getPublicCommunities:', error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error('Error al obtener las comunidades públicas.');
    }
};

export const getCommunityDetails = async (communityId) => {
    try {
        const response = await api.get(`/communities/${communityId}`);
        return response.data;
    } catch (error) {
        console.error(`Error en getCommunityDetails para communityId ${communityId}:`, error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error('Error al obtener detalles de la comunidad.');
    }
};

export const joinCommunity = async (communityId) => {
    try {
        const response = await api.post(`/communities/${communityId}/members`, {});
        return response.data;
    } catch (error) {
        console.error(`Error en joinCommunity para communityId ${communityId}:`, error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error('Error al unirse a la comunidad.');
    }
};

export const leaveCommunity = async (communityId) => {
    try {
        const response = await api.delete(`/communities/${communityId}/members`);
        return response.data;
    } catch (error) {
        console.error(`Error en leaveCommunity para communityId ${communityId}:`, error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error('Error al salir de la comunidad.');
    }
};

export const createCommunity = async (communityData) => {
    try {
        const response = await api.post('/communities', communityData);
        return response.data;
    } catch (error) {
        console.error('Error en createCommunity:', error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error('Error al crear la comunidad.');
    }
};

export const updateCommunity = async (communityId, communityData) => {
    try {
        const response = await api.put(`/communities/${communityId}`, communityData);
        return response.data.comunidad || response.data;
    } catch (error) {
        console.error(`Error en updateCommunity para communityId ${communityId}:`, error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error('Error al actualizar la comunidad.');
    }
};

export const uploadCommunityLogo = async (communityId, logoFile) => {
    const formData = new FormData();
    formData.append('communityLogo', logoFile);
    try {
        const response = await api.patch(`/communities/${communityId}/logo`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data.comunidad || response.data;
    } catch (error) {
        console.error(`Error en uploadCommunityLogo para communityId ${communityId}:`, error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error('Error al subir el logo.');
    }
};

export const deleteCommunityLogo = async (communityId) => {
    try {
        const response = await api.delete(`/communities/${communityId}/logo`);
        return response.data.comunidad || response.data;
    } catch (error) {
        console.error(`Error en deleteCommunityLogo para communityId ${communityId}:`, error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error('Error al eliminar el logo.');
    }
};

export const uploadCommunityBanner = async (communityId, bannerFile) => {
    const formData = new FormData();
    formData.append('communityBanner', bannerFile);
    try {
        const response = await api.patch(`/communities/${communityId}/banner`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data.comunidad || response.data;
    } catch (error) {
        console.error(`Error en uploadCommunityBanner para communityId ${communityId}:`, error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error('Error al subir el banner.');
    }
};

export const deleteCommunityBanner = async (communityId) => {
    try {
        const response = await api.delete(`/communities/${communityId}/banner`);
        return response.data.comunidad || response.data;
    } catch (error) {
        console.error(`Error en deleteCommunityBanner para communityId ${communityId}:`, error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error('Error al eliminar el banner.');
    }
};

export const getCommunityMembers = async (communityId) => {
    try {
        const response = await api.get(`/communities/${communityId}/members`);
        return response.data;
    } catch (error) {
        console.error(`Error en getCommunityMembers para communityId ${communityId}:`, error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error('Error al obtener miembros.');
    }
};

export const updateMemberRole = async (communityId, memberUserId, role) => {
    try {
        const response = await api.patch(`/communities/${communityId}/members/${memberUserId}/role`, { role });
        return response.data;
    } catch (error) {
        console.error(`Error en updateMemberRole para memberId ${memberUserId}:`, error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error('Error al actualizar rol del miembro.');
    }
};

export const removeMemberFromCommunity = async (communityId, memberUserId) => {
    try {
        const response = await api.delete(`/communities/${communityId}/members/${memberUserId}`);
        return response.data;
    } catch (error) {
        console.error(`Error en removeMemberFromCommunity para memberId ${memberUserId}:`, error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error('Error al expulsar miembro.');
    }
};

export const toggleMemberPremiumPermission = async (communityId, memberUserId, canPublishPremiumContent) => {
    try {
        const response = await api.patch(`/communities/${communityId}/members/${memberUserId}/toggle-premium-permission`, { canPublishPremiumContent });
        return response.data;
    } catch (error) {
        console.error(`Error en toggleMemberPremiumPermission para memberId ${memberUserId}:`, error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error('Error al cambiar permiso premium.');
    }
};

export const getSuggestedCommunities = async () => {
    try {
        // Asumiendo que crearás un endpoint para esto en el futuro.
        const response = await api.get('/communities/suggested');
        return response.data;
    } catch (error) {
        console.error('Error en getSuggestedCommunities:', error.response ? error.response.data : error.message);
        // Devolvemos un array vacío en caso de error para no romper el WelcomeFeed
        return [];
    }
};

export const deleteCommunity = async (communityId) => {
    try {
        const response = await api.delete(`/communities/${communityId}`);
        return response.data;
    } catch (error) {
        console.error(`Error en deleteCommunity para communityId ${communityId}:`, error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error('Error al eliminar la comunidad.');
    }
};

export const getCommunitySubscribers = async (communityId) => {
    try {
        const response = await api.get(`/communities/${communityId}/subscribers`);
        return response.data;
    } catch (error) {
        console.error("Error fetching community subscribers:", error);
        throw error.response?.data || new Error('No se pudo obtener la lista de suscriptores.');
    }
};