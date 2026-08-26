import api from '../../../services/axios';
import { mockSolicitudes } from '../data/mockSolicitudes';

export const crearSolicitud = async (payload) => {
    try {
        const response = await api.post('/solicitudes-agrupacion', payload);
        return { success: true, data: response.data };
    } catch (error) {
        const mensaje = error.response?.data?.message
            || Object.values(error.response?.data?.errors || {})[0]?.[0]
            || 'No se pudo enviar la solicitud. Intenta de nuevo.';
        return { success: false, error: mensaje };
    }
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// TODO: reemplazar por `api.get('/solicitudes-agrupacion')` cuando el backend exista.
export const obtenerSolicitudes = async () => {
    await delay(300);
    return { success: true, data: [...mockSolicitudes] };
};

// TODO: reemplazar por `api.patch('/solicitudes-agrupacion/:id')` cuando el backend exista.
export const actualizarEstadoSolicitud = async (id, nuevoEstado) => {
    await delay(300);
    const solicitud = mockSolicitudes.find((s) => s.id === id);

    if (!solicitud) {
        return { success: false, error: 'Solicitud no encontrada' };
    }

    solicitud.estado = nuevoEstado;
    return { success: true, data: { ...solicitud } };
};

// TODO: reemplazar por `api.delete('/solicitudes-agrupacion/:id')` cuando el backend exista.
export const eliminarSolicitud = async (id) => {
    await delay(300);
    const index = mockSolicitudes.findIndex((s) => s.id === id);

    if (index === -1) {
        return { success: false, error: 'Solicitud no encontrada' };
    }

    mockSolicitudes.splice(index, 1);
    return { success: true };
};
