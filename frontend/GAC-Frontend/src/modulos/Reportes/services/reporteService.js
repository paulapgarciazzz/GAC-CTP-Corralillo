import api from '../../../services/axios';

export const obtenerReporteAgrupaciones = async () => {
    try {
        const response = await api.get('/reportes/agrupaciones');
        return { success: true, data: response.data.data };
    } catch (error) {
        const mensaje = error.response?.data?.message || 'No se pudo cargar el reporte.';
        return { success: false, error: mensaje };
    }
};
