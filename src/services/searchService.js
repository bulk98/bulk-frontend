// src/services/searchService.js
import api from './api';

/**
 * Realiza una búsqueda global en el backend.
 * @param {string} query - El término de búsqueda.
 * @returns {Promise<object>} - Una promesa que resuelve a un objeto con { communities, posts }.
 */
export const performSearch = async (query) => {
  if (!query || query.trim() === '') {
    return { communities: [], posts: [] };
  }

  try {
    const response = await api.get('/search', {
      params: {
        q: query
      }
    });
    return response.data; 
  } catch (error) {
    console.error("Error en el servicio de búsqueda:", error.response ? error.response.data : error.message);
    // En caso de error, devolvemos un objeto vacío para no romper el frontend
    return { communities: [], posts: [] };
  }
};