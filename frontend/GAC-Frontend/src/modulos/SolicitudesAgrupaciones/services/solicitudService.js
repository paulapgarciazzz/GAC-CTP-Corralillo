import api from '../../../services/axios';

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
