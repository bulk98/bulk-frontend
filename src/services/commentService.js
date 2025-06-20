// src/services/commentService.js
import api from './api';

const getCommentsByPost = async (postId, page = 1, limit = 10) => {
    try {
        const response = await api.get(`/posts/${postId}/comments`, {
            params: { page, limit },
            handledByComponent: true
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || error.message);
    }
};

const createComment = async (postId, commentData) => {
    try {
        const response = await api.post(`/posts/${postId}/comments`, commentData, {
            handledByComponent: true // 👈 Marca la petición como manejada por el frontend
        });
        return response.data;
    } catch (error) {
        const err = new Error(error.response?.data?.error || error.message || 'Error al crear el comentario.');
        err.status = error.response?.status;
        err.handledByComponent = true; // 👈 Esto evitará que el interceptor cierre sesión
        throw err;
    }
};

const deleteComment = async (commentId) => {
    try {
        const response = await api.delete(`/comments/${commentId}`, {
            handledByComponent: true
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || error.message);
    }
};

const updateComment = async (commentId, commentData) => {
    try {
        const response = await api.put(`/comments/${commentId}`, commentData, {
            handledByComponent: true
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || error.message);
    }
};

export { getCommentsByPost, createComment, deleteComment, updateComment };
