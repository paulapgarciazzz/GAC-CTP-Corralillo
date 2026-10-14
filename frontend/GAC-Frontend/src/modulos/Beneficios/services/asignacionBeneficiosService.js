import api from '../../../services/axios';
import { obtenerSolicitudes } from '../../SolicitudesAgrupaciones/services/solicitudService';

const extraerErrores = (error) => error.response?.data?.errors ?? {};

const mensajePorEstado = (status, fallback) => {
    if (status === 404) return 'No se encontró la asignación solicitada.';
    if (status === 422) return 'Revisa los datos ingresados.';
    if (status === 500) return 'Ocurrió un error interno del servidor.';
    return fallback;
};

const manejarError = (error, fallback) => ({
    success: false,
    status: error.response?.status,
    error: error.response?.data?.message
        || Object.values(extraerErrores(error))[0]?.[0]
        || mensajePorEstado(error.response?.status, fallback),
    errors: extraerErrores(error),
});

export const obtenerSolicitudesAprobadas = async () => {
    const resultado = await obtenerSolicitudes();
    if (!resultado.success) return resultado;

    return {
        success: true,
        data: resultado.data.filter((solicitud) => solicitud.estado === 'aprobada'),
    };
};

export const obtenerAsignaciones = async () => {
    try {
        const response = await api.get('/asignaciones-beneficios');
        return { success: true, data: response.data.data ?? [] };
    } catch (error) {
        return manejarError(error, 'No se pudieron cargar las asignaciones de beneficios.');
    }
};

export const crearAsignacion = async (payload) => {
    try {
        const response = await api.post('/asignaciones-beneficios', payload);
        return { success: true, data: response.data.data };
    } catch (error) {
        return manejarError(error, 'No se pudo crear la asignación de beneficios.');
    }
};

export const actualizarAsignacion = async (id, payload) => {
    try {
        const response = await api.patch(`/asignaciones-beneficios/${id}`, payload);
        return { success: true, data: response.data.data };
    } catch (error) {
        return manejarError(error, 'No se pudo actualizar la asignación de beneficios.');
    }
};
