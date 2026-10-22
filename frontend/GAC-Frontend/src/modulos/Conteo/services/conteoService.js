import api from '../../../services/axios';
import { manejarError } from '../../../services/manejoErrores';

const consultar = async (url, params, fallback) => {
    try {
        const response = await api.get(url, { params });
        return { success: true, data: response.data.data };
    } catch (error) {
        return { ...manejarError(error, fallback), status: error.response?.status };
    }
};

// Panel (sesión + permiso conteo.ver).
export const obtenerOcupacionActual = () =>
    consultar('/conteo/ocupacion-actual', undefined, 'No se pudo obtener la ocupación actual.');

export const obtenerMovimientos = (params = {}) =>
    consultar('/conteo/movimientos', params, 'No se pudo obtener el historial de movimientos.');

export const obtenerSensores = () =>
    consultar('/conteo/sensores', undefined, 'No se pudo obtener el estado de los sensores.');

export const obtenerReporteConteo = (fecha) =>
    consultar('/conteo/reporte', { fecha }, 'No se pudo generar el reporte de conteo.');

// Público (landing, sin sesión): solo la ocupación estimada.
export const obtenerOcupacionPublica = () =>
    consultar('/public/conteo/ocupacion', undefined, 'No se pudo obtener la ocupación.');
