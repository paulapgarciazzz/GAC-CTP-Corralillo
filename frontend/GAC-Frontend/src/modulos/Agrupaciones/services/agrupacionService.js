import api from '../../../services/axios';

const extraerMensajeError = (error, fallback) =>
    error.response?.data?.message
    || Object.values(error.response?.data?.errors || {})[0]?.[0]
    || fallback;

export const obtenerAgrupaciones = async () => {
    try {
        const response = await api.get('/agrupaciones');
        return { success: true, data: response.data.data };
    } catch (error) {
        const mensaje = extraerMensajeError(error, 'No se pudieron cargar las agrupaciones.');
        return { success: false, error: mensaje };
    }
};

export const actualizarAgrupacion = async (id, payload) => {
    try {
        const { encargado, ...datosAgrupacion } = payload;
        const { cedula, ...datosEncargado } = encargado;

        await api.patch(`/encargados/${cedula}`, datosEncargado);
        const response = await api.put(`/agrupaciones/${id}`, datosAgrupacion);

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
