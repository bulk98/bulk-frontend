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

/**
 * Solicita un correo de reseteo de contraseña.
 * @param {string} email - El correo del usuario.
 */
export const requestPasswordReset = async (email) => {
    try {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    } catch (error) {
        console.error("Error en el servicio requestPasswordReset:", error);
        throw error.response?.data || new Error('Error al solicitar el reseteo de contraseña.');
    }
};

/**
 * Envía el token y la nueva contraseña para restablecerla.
 * @param {string} token - El token recibido en el correo.
 * @param {string} password - La nueva contraseña.
 */
export const resetPassword = async (token, password) => {
    try {
        const response = await api.post(`/auth/reset-password/${token}`, { password });
        return response.data;
    } catch (error) {
        console.error("Error en el servicio resetPassword:", error);
        throw error.response?.data || new Error('Error al restablecer la contraseña.');
    }
};

/**
 * Llama al endpoint del backend para verificar un token de email.
 * @param {string} token - El token de verificación de la URL.
 */
export const verifyEmailToken = async (token) => {
    try {
        // Hacemos una petición GET a la ruta de verificación.
        // No necesitamos enviar un cuerpo, solo el token en la URL.
        // Como la respuesta del backend es una redirección, Axios la seguirá.
        // Si la redirección es a una página de éxito, la promesa se resolverá.
        // Si es a una de error, podría lanzar un error que atrapamos aquí.
        // Usamos fetch directamente para un mejor control de las redirecciones.
        const response = await fetch(`${api.defaults.baseURL}/auth/verify-email/${token}`);
        
        // Si la respuesta final (después de la redirección) es exitosa, todo está bien.
        if (response.ok) {
            return { success: true, url: response.url };
        } else {
            // Si el backend respondió con un error antes de redirigir (aunque lo configuramos para que siempre redirija).
            throw new Error('El enlace de verificación es inválido o ha expirado.');
        }
    } catch (error) {
        console.error("Error en el servicio verifyEmailToken:", error);
        throw error;
    }
};