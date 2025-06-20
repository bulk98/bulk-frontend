// src/services/searchService.js
import api from './api';

export const performSearch = async (query) => {
  if (!query?.trim()) return { communities: [], posts: [], users: [] };

  try {
    const { data } = await api.get('/search', { params: { q: query } });
    return data;
  } catch (error) {
    console.error("Error en búsqueda:", error);
    return { communities: [], posts: [], users: [] };
  }
};
