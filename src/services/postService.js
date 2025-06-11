// src/services/postService.js
import api from './api';

export const getPostsByCommunity = async (communityId, page = 1, limit = 10) => {
    try {
        const response = await api.get(`/comunidades/${communityId}/posts`, {
            params: { page, limit }
        });
        return response.data;
    } catch (error) {
        let errorMessage = 'Error al obtener los posts.'; // Mensaje por defecto
        if (error.response && error.response.data) {
            // Si la respuesta tiene un objeto JSON con 'error' o 'message', úsalo.
            errorMessage = error.response.data.error || error.response.data.message || errorMessage;
        } else if (error.message) {
            // Si no, usa el mensaje de error general.
            errorMessage = error.message;
        }
        console.error(`Error en getPostsByCommunity para communityId ${communityId}:`, errorMessage);
        throw error.response ? error.response.data : new Error(errorMessage || 'Error al obtener los posts.');
    }
};

export const getPostById = async (postId) => {
    try {
        const response = await api.get(`/posts/${postId}`);
        return response.data;
    } catch (error) {
        const errorMessage = error.response ? (error.response.data.message || error.response.data.error) : error.message;
        console.error(`Error en getPostById para postId ${postId}:`, errorMessage);
        throw error.response ? error.response.data : new Error(errorMessage || 'Error al obtener el post.');
    }
};

export const createPost = async (communityId, postData, imageFile = null) => {
    const formData = new FormData();
    formData.append('title', postData.title);
    formData.append('content', postData.content);
    if (postData.esPremium !== undefined) {
        formData.append('esPremium', postData.esPremium);
    }
    if (imageFile) {
        formData.append('postImage', imageFile);
    }

    try {
        const response = await api.post(`/comunidades/${communityId}/posts`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (error) {
        const errorMessage = error.response ? (error.response.data.message || error.response.data.error) : error.message;
        console.error(`Error en createPost para communityId ${communityId}:`, errorMessage);
        throw error.response ? error.response.data : new Error(errorMessage || 'Error al crear el post.');
    }
};

export const toggleLikePost = async (postId) => {
    try {
        const response = await api.post(`/posts/${postId}/react`, {});
        return response.data; 
    } catch (error) {
        const errorMessage = error.response ? (error.response.data.message || error.response.data.error) : error.message;
        console.error(`Error en toggleLikePost para postId ${postId}:`, errorMessage);
        throw error.response ? error.response.data : new Error(errorMessage || 'Error al procesar la reacción.');
    }
};