import api from '../../../services/axios';

const extraerMensajeError = (error, fallback) =>
    error.response?.data?.message
    || Object.values(error.response?.data?.errors || {})[0]?.[0]
    || fallback;

const normalizarSolicitud = (data) => ({
    ...data,
    encargado: data.agrupacion?.encargado,
    fecha_solicitud: data.fecha_solicitud?.split('T')[0] ?? data.fecha_solicitud,
    hora_asignada: data.hora_asignada?.slice(0, 5) ?? data.hora_asignada,
});

export const crearSolicitud = async (payload) => {
    try {
        const { cedula, ...datosEncargado } = payload.encargado;

        let encargadoExiste = true;
        try {
            await api.get(`/encargados/${cedula}`);
        } catch (error) {
            if (error.response?.status === 404) {
                encargadoExiste = false;
            } else {
                throw error;
            }
        }

        if (!encargadoExiste) {
            await api.post('/encargados', { cedula, ...datosEncargado });
        }

        const agrupacionResponse = await api.post('/agrupaciones', {
            ced_encargado: cedula,
            nombre: payload.agrupacion.nombre,
            lugar_procedencia: payload.agrupacion.lugar_procedencia,
            cantidad_integrantes: payload.agrupacion.cantidad_integrantes,
            archivo_adjunto: payload.agrupacion.archivo_adjunto,
        });

        const response = await api.post('/solicitudes-agrupaciones', {
            id_agrupacion: agrupacionResponse.data.data.id,
            fecha_solicitud: payload.solicitud.fecha_solicitud,
            comentarios: payload.solicitud.comentarios,
            fecha_asignada: payload.solicitud.fecha_asignada || null,
            hora_asignada: payload.solicitud.hora_asignada || null,
        });

        return { success: true, data: response.data };
    } catch (error) {
        const mensaje = extraerMensajeError(error, 'No se pudo enviar la solicitud. Intenta de nuevo.');
        return { success: false, error: mensaje };
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
