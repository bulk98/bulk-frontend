// src/services/postService.js
import api from './api';

export const getPostsByCommunity = async (communityId, page = 1, limit = 10) => {
    try {
        const response = await api.get(`/comunidades/${communityId}/posts`, {
            params: { page, limit }
        });
        return response.data;
    } catch (error) {
        let errorMessage = 'Error al obtener los posts.';
        if (error.response && error.response.data) {
            errorMessage = error.response.data.error || error.response.data.message || errorMessage;
        } else if (error.message) {
            errorMessage = error.message;
        }
        console.error(`Error en getPostsByCommunity para communityId ${communityId}:`, errorMessage);
        throw new Error(errorMessage);
    }
};

export const getPostById = async (postId) => {
    try {
        const response = await api.get(`/posts/${postId}`);
        return response.data;
    } catch (error) {
        const errorMessage = error.response ? (error.response.data.message || error.response.data.error) : error.message;
        console.error(`Error en getPostById para postId ${postId}:`, errorMessage);
        throw new Error(errorMessage || 'Error al obtener el post.');
    }
};

export const createPost = async (communityId, postData, imageFile = null) => {
    const formData = new FormData();
    formData.append('title', postData.title);
    formData.append('content', postData.content);

    // Lógica robusta: El valor de esPremium (true/false) viene de postData
    // y lo añadimos al formulario. FormData lo convertirá en texto "true" o "false".
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
        throw new Error(errorMessage || 'Error al crear el post.');
    }
};

export const toggleLikePost = async (postId) => {
    try {
        const response = await api.post(`/posts/${postId}/react`, {});
        return response.data;
    } catch (error) {
        const errorMessage = error.response ? (error.response.data.message || error.response.data.error) : error.message;
        console.error(`Error en toggleLikePost para postId ${postId}:`, errorMessage);
        throw new Error(errorMessage || 'Error al procesar la reacción.');
    }
};