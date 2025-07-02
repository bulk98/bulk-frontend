import api from './api';

/**
 * Obtiene todos los planes de una comunidad.
 * @param {string} communityId - ID de la comunidad.
 */
export const getPlansForCommunity = (communityId) => {
    return api.get(`/communities/${communityId}/plans`);
};

/**
 * Crea un nuevo plan para una comunidad.
 * @param {string} communityId - ID de la comunidad.
 * @param {object} planData - Datos del plan (name, price, description).
 */
export const createPlan = (communityId, planData) => {
    return api.post(`/communities/${communityId}/plans`, planData);
};

/**
 * Actualiza un plan existente.
 * @param {string} planId - ID del plan a actualizar.
 * @param {object} planData - Datos a actualizar.
 */
export const updatePlan = (planId, planData) => {
    return api.put(`/plans/${planId}`, planData);
};

/**
 * Elimina un plan.
 * @param {string} planId - ID del plan a eliminar.
 */
export const deletePlan = (planId) => {
    return api.delete(`/plans/${planId}`);
};