import api from '../../../services/axios';

const extraerMensajeError = (error, fallback) =>
    error.response?.data?.message
    || Object.values(error.response?.data?.errors || {})[0]?.[0]
    || fallback;

const extraerErroresValidacion = (error) => error.response?.data?.errors ?? {};

export const obtenerEncargados = async () => {
    try {
        const response = await api.get('/encargados');
        return { success: true, data: response.data.data ?? [] };
    } catch (error) {
        return { success: false, error: extraerMensajeError(error, 'No se pudieron cargar los encargados.') };
    }
};

export const buscarEncargadoPorCedula = async (cedula) => {
    const identificacion = String(cedula ?? '').trim();
    if (!identificacion) {
        return { success: false, error: 'Ingresa una cédula para realizar la búsqueda.' };
    }

    try {
        const response = await api.get(`/encargados/${encodeURIComponent(identificacion)}`);
        return { success: true, data: response.data.data };
    } catch (error) {
        if (error.response?.status === 404) {
            return { success: false, notFound: true };
        }
        const mensaje = extraerMensajeError(error, 'No se pudo buscar al encargado. Intenta de nuevo.');
        return { success: false, error: mensaje };
    }
};

export const obtenerAgrupacionesPorEncargado = async (cedula) => {
    const identificacion = String(cedula ?? '').trim();
    if (!identificacion) {
        return { success: false, error: 'No se puede cargar agrupaciones sin una cédula.' };
    }

    try {
        const response = await api.get(`/encargados/${encodeURIComponent(identificacion)}/agrupaciones`);
        return { success: true, data: response.data.data ?? [] };
    } catch (error) {
        const mensaje = extraerMensajeError(error, 'No se pudieron cargar las agrupaciones del encargado.');
        return { success: false, error: mensaje };
    }
};

export const actualizarEncargado = async (cedula, datosParciales) => {
    const identificacion = String(cedula ?? '').trim();
    if (!identificacion) {
        return { success: false, error: 'No se puede actualizar un encargado sin cédula.' };
    }

    try {
        const response = await api.patch(`/encargados/${encodeURIComponent(identificacion)}`, datosParciales);
        return { success: true, data: response.data.data };
    } catch (error) {
        return {
            success: false,
            error: extraerMensajeError(error, 'No se pudieron actualizar los datos del encargado.'),
            errors: extraerErroresValidacion(error),
        };
    }
};

export const eliminarEncargado = async (cedula) => {
    const identificacion = String(cedula ?? '').trim();
    if (!identificacion) {
        return { success: false, error: 'No se puede eliminar un encargado sin cédula.' };
    }

    try {
        await api.delete(`/encargados/${encodeURIComponent(identificacion)}`);
        return { success: true };
    } catch (error) {
        return { success: false, error: extraerMensajeError(error, 'No se pudo eliminar el encargado.') };
    }
};
