// RUTA: src/services/postService.js

import api from './api';

export const createPost = async (communityId, postData) => {
    const formData = new FormData();

    formData.append('title', postData.title);
    formData.append('content', postData.content);
    formData.append('esPremium', String(postData.esPremium)); // ✅ Forzamos string para que el backend lo entienda

    if (postData.postImage) {
        formData.append('postImage', postData.postImage);
    }

    try {
        const response = await api.post(`/comunidades/${communityId}/posts`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.error || "Ocurrió un error al crear el post.";
        throw new Error(errorMessage);
    }
};

// --- Otras funciones (sin cambios) ---
export const getPostsByCommunity = async (communityId, page = 1, limit = 10) => {
    try {
        const response = await api.get(`/comunidades/${communityId}/posts`, { params: { page, limit } });
        return response.data;
    } catch (error) {
        throw new Error("Error al obtener los posts.");
    }
};

export const getPostDetails = async (postId) => {
    try {
        const response = await api.get(`/posts/${postId}`);
        return response.data;
    } catch (error) {
        throw new Error("Error al obtener los detalles del post.");
    }
};

export const toggleLikePost = async (postId) => {
    try {
        const response = await api.post(`/posts/${postId}/react`);
        return response.data;
    } catch (error) {
        throw new Error("Error al procesar la reacción.");
    }
};

export const deletePost = async (postId) => {
    try {
        const response = await api.delete(`/posts/${postId}`);
        return response.data;
    } catch (error) {
        throw new Error("Error al eliminar el post.");
    }
};
