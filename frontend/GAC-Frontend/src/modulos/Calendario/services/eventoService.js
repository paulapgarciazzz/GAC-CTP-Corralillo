import { format } from 'date-fns';
import api from '../../../services/axios';
import { manejarError } from './manejoErrores';

const desdeApi = (evento) => {
    const allDay = Boolean(evento.todo_el_dia) || !evento.hora_inicio;

    return {
        id: evento.id_evento,
        title: evento.nombre,
        start: new Date(`${evento.fecha_inicio}T${allDay ? '00:00' : evento.hora_inicio}`),
        end: new Date(`${evento.fecha_fin}T${allDay ? '23:59' : evento.hora_fin || '23:59'}`),
        category: evento.categoria || 'info',
        allDay,
        fechaInicio: evento.fecha_inicio,
        activo: evento.estado !== false,
    };
};

const haciaApi = (evento) => ({
    nombre: evento.title,
    fecha_inicio: format(evento.start, 'yyyy-MM-dd'),
    fecha_fin: format(evento.end, 'yyyy-MM-dd'),
    hora_inicio: evento.allDay ? null : format(evento.start, 'HH:mm'),
    hora_fin: evento.allDay ? null : format(evento.end, 'HH:mm'),
    todo_el_dia: Boolean(evento.allDay),
    categoria: evento.category,
});

export const obtenerEventos = async () => {
    try {
        const response = await api.get('/eventos');
        return { success: true, data: response.data.data.map(desdeApi) };
    } catch (error) {
        return manejarError(error, 'No se pudieron cargar los eventos.');
    }
};

export const crearEvento = async (evento) => {
    try {
        const response = await api.post('/eventos', haciaApi(evento));
        return { success: true, data: desdeApi(response.data.data) };
    } catch (error) {
        return manejarError(error, 'No se pudo crear el evento.');
    }
};

export const actualizarEvento = async (id, evento) => {
    try {
        const response = await api.patch(`/eventos/${encodeURIComponent(id)}`, haciaApi(evento));
        return { success: true, data: desdeApi(response.data.data) };
    } catch (error) {
        return manejarError(error, 'No se pudo actualizar el evento.');
    }
};

export const eliminarEvento = async (id) => {
    try {
        await api.delete(`/eventos/${encodeURIComponent(id)}`);
        return { success: true };
    } catch (error) {
        return manejarError(error, 'No se pudo eliminar el evento.');
    }
};
