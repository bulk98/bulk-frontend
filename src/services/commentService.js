// src/services/commentService.js
import api from './api';

const getCommentsByPost = async (postId, page = 1, limit = 10) => {
    try {
        const response = await api.get(`/posts/${postId}/comments`, { params: { page, limit } });
        return response.data;
    } catch (error) {
        const errorMessage = error.response ? (error.response.data.message || error.response.data.error) : error.message;
        console.error(`Error en getCommentsByPost para postId ${postId}:`, errorMessage);
        throw error.response ? error.response.data : new Error(errorMessage || 'Error al obtener los comentarios.');
    }
};

const createComment = async (postId, commentData) => {
    try {
        const response = await api.post(`/posts/${postId}/comments`, commentData);
        return response.data;
    } catch (error) {
        const errorMessage = error.response ? (error.response.data.message || error.response.data.error) : error.message;
        console.error(`Error en createComment para postId ${postId}:`, errorMessage);
        throw error.response ? error.response.data : new Error(errorMessage || 'Error al crear el comentario.');
    }
};

const deleteComment = async (commentId) => {
    try {
        const response = await api.delete(`/comments/${commentId}`);
        return response.data;
    } catch (error) {
        const errorMessage = error.response ? (error.response.data.message || error.response.data.error) : error.message;
        console.error(`Error en deleteComment para commentId ${commentId}:`, errorMessage);
        throw error.response ? error.response.data : new Error(errorMessage || 'Error al eliminar el comentario.');
    }
};

const updateComment = async (commentId, commentData) => {
    try {
        const response = await api.put(`/comments/${commentId}`, commentData);
        return response.data;
    } catch (error) {
        const errorMessage = error.response ? (error.response.data.message || error.response.data.error) : error.message;
        console.error(`Error en updateComment para commentId ${commentId}:`, errorMessage);
        throw error.response ? error.response.data : new Error(errorMessage || 'Error al actualizar el comentario.');
    }
};

export { getCommentsByPost, createComment, deleteComment, updateComment };