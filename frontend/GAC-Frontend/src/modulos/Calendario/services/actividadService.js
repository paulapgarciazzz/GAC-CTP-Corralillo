import api from '../../../services/axios';
import { manejarError } from './manejoErrores';

export const obtenerActividades = async () => {
    try {
        const response = await api.get('/actividades');
        return { success: true, data: response.data.data };
    } catch (error) {
        return manejarError(error, 'No se pudieron cargar las actividades.');
    }
};

// El backend las devuelve ordenadas por fecha y hora de inicio.
export const obtenerActividadesDeEvento = async (idEvento) => {
    try {
        const response = await api.get(`/eventos/${encodeURIComponent(idEvento)}/actividades`);
        return { success: true, data: response.data.data };
    } catch (error) {
        return manejarError(error, 'No se pudieron cargar las actividades del evento.');
    }
};

export const crearActividad = async (actividad) => {
    try {
        const response = await api.post('/actividades', actividad);
        return { success: true, data: response.data.data };
    } catch (error) {
        return manejarError(error, 'No se pudo crear la actividad.');
    }
};

export const actualizarActividad = async (id, actividad) => {
    try {
        const response = await api.patch(`/actividades/${encodeURIComponent(id)}`, actividad);
        return { success: true, data: response.data.data };
    } catch (error) {
        return manejarError(error, 'No se pudo actualizar la actividad.');
    }
};

export const eliminarActividad = async (id) => {
    try {
        await api.delete(`/actividades/${encodeURIComponent(id)}`);
        return { success: true };
    } catch (error) {
        return manejarError(error, 'No se pudo eliminar la actividad.');
    }
};

export const obtenerAgrupacionesAprobadas = async (idEvento) => {
    try {
        const response = await api.get(`/eventos/${encodeURIComponent(idEvento)}/agrupaciones-aprobadas`);
        return { success: true, data: response.data.data };
    } catch (error) {
        return manejarError(error, 'No se pudieron cargar las agrupaciones aprobadas.');
    }
};
