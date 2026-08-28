import { mockReporteAgrupaciones } from '../data/mockReporteAgrupaciones';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// TODO: reemplazar por `api.get('/reportes/agrupaciones')` cuando el backend exista.
export const obtenerReporteAgrupaciones = async () => {
    await delay(300);
    return { success: true, data: { ...mockReporteAgrupaciones } };
};
