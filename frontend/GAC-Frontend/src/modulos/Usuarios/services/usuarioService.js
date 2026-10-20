import axios from 'axios';
import api from '../../../services/axios';

const extraerMensajeError = (error, fallback) =>
    error.response?.data?.message
    || Object.values(error.response?.data?.errors || {})[0]?.[0]
    || fallback;

const extraerErroresValidacion = (error) => error.response?.data?.errors ?? {};

/**
 * GET paginado. Devuelve `{ success, data, meta }` o `{ success: false, cancelado }`
 * cuando la petición fue reemplazada por otra más reciente.
 */
const listarPaginado = async (url, { buscar, page, signal }, mensajeError) => {
    try {
        const response = await api.get(url, {
            params: { buscar: buscar || undefined, page },
            signal,
        });
        return { success: true, data: response.data.data ?? [], meta: response.data.meta ?? null };
    } catch (error) {
        if (axios.isCancel(error)) return { success: false, cancelado: true };
        return { success: false, error: extraerMensajeError(error, mensajeError) };
    }
};

export const obtenerUsuarios = (opciones) =>
    listarPaginado('/usuarios', opciones, 'No se pudieron cargar los usuarios.');

export const obtenerUsuariosConPermisos = (opciones) =>
    listarPaginado('/usuarios/permisos', opciones, 'No se pudieron cargar los permisos de los usuarios.');

export const crearUsuario = async (datos) => {
    try {
        const response = await api.post('/usuarios', datos);
        return { success: true, data: response.data.data };
    } catch (error) {
        return {
            success: false,
            error: extraerMensajeError(error, 'No se pudo crear el usuario.'),
            errors: extraerErroresValidacion(error),
        };
    }
};

export const actualizarUsuario = async (id, datos) => {
    try {
        const response = await api.patch(`/usuarios/${id}`, datos);
        return { success: true, data: response.data.data };
    } catch (error) {
        return {
            success: false,
            error: extraerMensajeError(error, 'No se pudo actualizar el usuario.'),
            errors: extraerErroresValidacion(error),
        };
    }
};

export const eliminarUsuario = async (id) => {
    try {
        await api.delete(`/usuarios/${id}`);
        return { success: true };
    } catch (error) {
        return { success: false, error: extraerMensajeError(error, 'No se pudo eliminar el usuario.') };
    }
};

/**
 * Actualiza los datos propios del usuario autenticado (cualquier rol).
 * Devuelve el usuario plano, igual que GET /user.
 */
export const actualizarPerfil = async (datos) => {
    try {
        const response = await api.patch('/perfil', datos);
        return { success: true, data: response.data };
    } catch (error) {
        return {
            success: false,
            error: extraerMensajeError(error, 'No se pudo actualizar el perfil.'),
            errors: extraerErroresValidacion(error),
        };
    }
};

export const guardarPermisosUsuario = async (id, permisos) => {
    try {
        const response = await api.put(`/usuarios/${id}/permisos`, { permisos });
        return { success: true, data: response.data.data };
    } catch (error) {
        return { success: false, error: extraerMensajeError(error, 'No se pudieron guardar los permisos.') };
    }
};
