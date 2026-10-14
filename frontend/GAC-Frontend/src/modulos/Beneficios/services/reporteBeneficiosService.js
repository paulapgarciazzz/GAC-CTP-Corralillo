import api from '../../../services/axios';
import { manejarError } from './beneficioService';

export const obtenerReporteBeneficios = async (params) => {
    try {
        const response = await api.get('/reportes/beneficios', { params });
        return { success: true, data: response.data.data };
    } catch (error) {
        return manejarError(error, 'No se pudo generar el reporte de beneficios.');
    }
};
