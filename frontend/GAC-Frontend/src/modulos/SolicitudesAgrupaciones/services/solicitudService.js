import api from '../../../services/axios';

const extraerMensajeError = (error, fallback) =>
    error.response?.data?.message
    || Object.values(error.response?.data?.errors || {})[0]?.[0]
    || fallback;

const extraerErroresValidacion = (error) => error.response?.data?.errors ?? {};

const normalizarSolicitud = (data) => ({
    ...data,
    encargado: data.agrupacion?.encargado,
    fecha_solicitud: data.fecha_solicitud?.split('T')[0] ?? data.fecha_solicitud,
    fecha_solicitada: data.fecha_solicitada?.split('T')[0] ?? data.fecha_solicitada,
    hora_solicitada: data.hora_solicitada?.slice(0, 5) ?? data.hora_solicitada,
    hora_asignada: data.hora_asignada?.slice(0, 5) ?? data.hora_asignada,
});

export const crearSolicitud = async (payload) => {
    try {
        const identificacion = String(payload.encargado?.cedula ?? '').trim();
        if (!identificacion) {
            return { success: false, error: 'Ingresa la cédula del encargado antes de enviar la solicitud.' };
        }

        const response = await api.post('/solicitudes-agrupaciones/nueva', payload);

        return { success: true, data: response.data };
    } catch (error) {
        const mensaje = extraerMensajeError(error, 'No se pudo enviar la solicitud. Intenta de nuevo.');
        return { success: false, error: mensaje, errors: extraerErroresValidacion(error) };
    }
};

export const crearSolicitudParaEncargadoExistente = async (payload) => {
    try {
        let idAgrupacion = payload.idAgrupacionSeleccionada;

        if (!idAgrupacion && payload.modoAgrupacion !== 'nueva') {
            return { success: false, error: 'Selecciona o registra una agrupación antes de continuar.' };
        }

        const response = await api.post('/solicitudes-agrupaciones/encargado-existente', {
            cedula: payload.cedula,
            id_agrupacion: idAgrupacion,
            agrupacion: payload.modoAgrupacion === 'nueva' ? payload.agrupacion : undefined,
            solicitud: payload.solicitud,
        });

        return { success: true, data: response.data };
    } catch (error) {
        const mensaje = extraerMensajeError(error, 'No se pudo enviar la solicitud. Intenta de nuevo.');
        return { success: false, error: mensaje, errors: extraerErroresValidacion(error) };
    }
};



export const obtenerSolicitudes = async () => {
    try {
        const response = await api.get('/solicitudes-agrupaciones');
        return { success: true, data: response.data.data.map(normalizarSolicitud) };
    } catch (error) {
        const mensaje = extraerMensajeError(error, 'No se pudieron cargar las solicitudes.');
        return { success: false, error: mensaje };
    }
};

export const actualizarEstadoSolicitud = async (id, nuevoEstado) => {
    try {
        const accion = nuevoEstado === 'aprobada' ? 'aprobar' : 'rechazar';
        const response = await api.patch(`/solicitudes-agrupaciones/${id}/${accion}`);
        return { success: true, data: normalizarSolicitud(response.data.data) };
    } catch (error) {
        const mensaje = extraerMensajeError(error, 'No se pudo actualizar el estado de la solicitud.');
        return { success: false, error: mensaje };
    }
};

export const actualizarSolicitud = async (id, payload) => {
    try {
        const response = await api.put(`/solicitudes-agrupaciones/${id}`, payload);
        return { success: true, data: normalizarSolicitud(response.data.data) };
    } catch (error) {
        const mensaje = extraerMensajeError(error, 'No se pudo actualizar la solicitud.');
        return { success: false, error: mensaje };
    }
};

export const enviarDetallesSolicitud = async (id) => {
    try {
        await api.post(`/solicitudes-agrupaciones/${id}/enviar-detalles`);
        return { success: true };
    } catch (error) {
        const mensaje = extraerMensajeError(error, 'No se pudo enviar el correo con los detalles.');
        return { success: false, error: mensaje };
    }
};

export const eliminarSolicitud = async (id) => {
    try {
        await api.delete(`/solicitudes-agrupaciones/${id}`);
        return { success: true };
    } catch (error) {
        const mensaje = extraerMensajeError(error, 'No se pudo eliminar la solicitud.');
        return { success: false, error: mensaje };
    }
};
