// src/services/authService.js
import api from './api';

const API_URL = '/auth'; // La URL base ya está configurada en api.js

/**
 * Envía las credenciales de login al backend.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>}
 */
export const loginUser = async (email, password) => {
    try {
        const response = await api.post(`${API_URL}/login`, {
            email: email,
            password: password,
        });
        return response.data;
    } catch (error) {
        console.error('Error en el servicio de loginUser:', error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error('Error al intentar iniciar sesión');
    }
};

/**
 * Envía los datos de registro de un nuevo usuario al backend.
 * @param {object} userData - Objeto completo con los datos del usuario de todos los pasos.
 * @returns {Promise<object>} La respuesta del servidor.
 */
export const registerUser = async (userData) => {
    try {
        const response = await api.post(`${API_URL}/registro`, userData);
        return response.data;
    } catch (error) {
        console.error('Error en el servicio de registerUser:', error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error('Error al intentar registrar el usuario');
    }
};