import api from '../../../services/axios';
import { manejarError } from './manejoErrores';

export const obtenerUbicaciones = async () => {
    try {
        const response = await api.get('/ubicaciones');
        return { success: true, data: response.data.data };
    } catch (error) {
        return manejarError(error, 'No se pudieron cargar las ubicaciones.');
    }
};

export const crearUbicacion = async (ubicacion) => {
    try {
        const response = await api.post('/ubicaciones', ubicacion);
        return { success: true, data: response.data.data };
    } catch (error) {
        return manejarError(error, 'No se pudo crear la ubicación.');
    }
};

export const actualizarUbicacion = async (id, ubicacion) => {
    try {
        const response = await api.patch(`/ubicaciones/${encodeURIComponent(id)}`, ubicacion);
        return { success: true, data: response.data.data };
    } catch (error) {
        return manejarError(error, 'No se pudo actualizar la ubicación.');
    }
};

export const eliminarUbicacion = async (id) => {
    try {
        await api.delete(`/ubicaciones/${encodeURIComponent(id)}`);
        return { success: true };
    } catch (error) {
        return manejarError(error, 'No se pudo eliminar la ubicación.');
    }
};
