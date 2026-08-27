import { mockAgrupaciones } from '../data/mockAgrupaciones';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// TODO: reemplazar por `api.get('/agrupaciones')` cuando el backend exista.
export const obtenerAgrupaciones = async () => {
    await delay(300);
    return { success: true, data: [...mockAgrupaciones] };
};

// TODO: reemplazar por `api.post('/agrupaciones')` cuando el backend exista.
export const crearAgrupacion = async ({ encargado, agrupacion }) => {
    await delay(300);
    const nuevaAgrupacion = {
        id: Math.max(0, ...mockAgrupaciones.map((a) => a.id)) + 1,
        foto_url: null,
        ...agrupacion,
        encargado,
    };

    mockAgrupaciones.push(nuevaAgrupacion);
    return { success: true, data: { ...nuevaAgrupacion } };
};

// TODO: reemplazar por `api.put('/agrupaciones/:id')` cuando el backend exista.
export const actualizarAgrupacion = async (id, payload) => {
    await delay(300);
    const agrupacion = mockAgrupaciones.find((a) => a.id === id);

    if (!agrupacion) {
        return { success: false, error: 'Agrupación no encontrada' };
    }

    Object.assign(agrupacion, payload);
    return { success: true, data: { ...agrupacion } };
};

// TODO: reemplazar por `api.delete('/agrupaciones/:id')` cuando el backend exista.
export const eliminarAgrupacion = async (id) => {
    await delay(300);
    const index = mockAgrupaciones.findIndex((a) => a.id === id);

    if (index === -1) {
        return { success: false, error: 'Agrupación no encontrada' };
    }

    mockAgrupaciones.splice(index, 1);
    return { success: true };
};
