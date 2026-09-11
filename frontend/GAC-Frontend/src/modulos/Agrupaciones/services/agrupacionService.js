import api from '../../../services/axios';

const extraerMensajeError = (error, fallback) =>
    error.response?.data?.message
    || Object.values(error.response?.data?.errors || {})[0]?.[0]
    || fallback;

const obtenerListadoAgrupaciones = async (endpoint) => {
    try {
        const response = await api.get(endpoint);
        return { success: true, data: response.data.data };
    } catch (error) {
        const mensaje = extraerMensajeError(error, 'No se pudieron cargar las agrupaciones.');
        return { success: false, error: mensaje };
    }
};

export const obtenerAgrupacionesAdministrativas = () => obtenerListadoAgrupaciones('/agrupaciones');

export const obtenerAgrupacionesAprobadas = () => obtenerListadoAgrupaciones('/agrupaciones/aprobadas');

export const crearAgrupacion = async (payload) => {
    try {
        const response = await api.post('/agrupaciones', payload);
        return { success: true, data: response.data.data };
    } catch (error) {
        const mensaje = extraerMensajeError(error, 'No se pudo registrar la agrupación.');
        return { success: false, error: mensaje };
    }
};

export const actualizarAgrupacion = async (id, payload) => {
    try {
        const { encargado, ...datosAgrupacion } = payload;
        delete datosAgrupacion.id;
        delete datosAgrupacion.nombre;
        delete datosAgrupacion.ced_encargado;
        if (encargado?.cedula) {
            const { cedula, ...datosEncargado } = encargado;
            await api.patch(`/encargados/${cedula}`, datosEncargado);
        }
        const response = await api.patch(`/agrupaciones/${id}`, datosAgrupacion);

        return { success: true, data: response.data.data };
    } catch (error) {
        const mensaje = extraerMensajeError(error, 'No se pudo actualizar la agrupación.');
        return { success: false, error: mensaje };
    }
};

export const eliminarAgrupacion = async (id) => {
    try {
        await api.delete(`/agrupaciones/${id}`);
        return { success: true };
    } catch (error) {
        const mensaje = extraerMensajeError(error, 'No se pudo eliminar la agrupación.');
        return { success: false, error: mensaje };
    }
};
