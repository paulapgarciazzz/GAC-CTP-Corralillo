import api from '../../../services/axios';

export const BENEFICIO_CONFIG = {
    alimentacion: {
        label: 'Alimentación',
        endpoint: '/alimentaciones',
        idField: 'id_alimentacion',
    },
    aula: {
        label: 'Aulas',
        endpoint: '/aulas',
        idField: 'id_aula',
    },
    mobiliario: {
        label: 'Mobiliario',
        endpoint: '/mobiliarios',
        idField: 'id_mobiliario',
    },
    ruta: {
        label: 'Rutas',
        endpoint: '/rutas',
        idField: 'id_ruta',
        oculto: true,
    },
    transporte: {
        label: 'Transporte',
        endpoint: '/transportes',
        idField: 'matricula',
    },
};

/** Texto que identifica a un beneficio en tarjetas y confirmaciones. */
export const nombreBeneficio = (categoria, beneficio) => (categoria === 'transporte'
    ? beneficio.matricula
    : beneficio.nombre ?? beneficio.nombre_ruta ?? beneficio.tiempo_comida);

/** "Eliminar aula", "Eliminar ruta", etc. */
export const textoEliminarBeneficio = (categoria) =>
    `Eliminar ${BENEFICIO_CONFIG[categoria].label.toLowerCase().replace(/s$/, '')}`;

const extraerErrores = (error) => error.response?.data?.errors ?? {};

const mensajePorEstado = (status, fallback) => {
    if (status === 401 || status === 403) return 'No tienes permisos para realizar esta acción.';
    if (status === 404) return 'No se encontró el beneficio solicitado.';
    if (status === 422) return 'Revisa los datos ingresados.';
    if (status === 500) return 'Ocurrió un error interno del servidor.';
    if (!status) return 'No se pudo conectar con el servidor. Revisa tu conexión.';
    return fallback;
};

// En un 500 el `message` del backend puede traer el detalle técnico (SQL), así que no se muestra.
const mensajeBackend = (error) => (error.response?.status >= 500 ? null : error.response?.data?.message);

export const manejarError = (error, fallback) => ({
    success: false,
    status: error.response?.status,
    error: mensajeBackend(error)
        || Object.values(extraerErrores(error))[0]?.[0]
        || mensajePorEstado(error.response?.status, fallback),
    errors: extraerErrores(error),
});

const obtenerConfig = (categoria) => BENEFICIO_CONFIG[categoria] ?? null;

export const obtenerBeneficios = async (categoria) => {
    const config = obtenerConfig(categoria);
    if (!config) return { success: false, error: 'Categoría de beneficio inválida.' };

    try {
        const response = await api.get(config.endpoint);
        return { success: true, data: response.data.data ?? [] };
    } catch (error) {
        return manejarError(error, `No se pudieron cargar los beneficios de ${config.label.toLowerCase()}.`);
    }
};

export const crearBeneficio = async (categoria, payload) => {
    const config = obtenerConfig(categoria);
    if (!config) return { success: false, error: 'Categoría de beneficio inválida.' };

    try {
        const response = await api.post(config.endpoint, payload);
        return { success: true, data: response.data.data };
    } catch (error) {
        return manejarError(error, 'No se pudo crear el beneficio.');
    }
};

export const actualizarBeneficio = async (categoria, id, payload) => {
    const config = obtenerConfig(categoria);
    if (!config) return { success: false, error: 'Categoría de beneficio inválida.' };

    try {
        const response = await api.patch(`${config.endpoint}/${encodeURIComponent(id)}`, payload);
        return { success: true, data: response.data.data };
    } catch (error) {
        return manejarError(error, 'No se pudo actualizar el beneficio.');
    }
};

export const eliminarBeneficio = async (categoria, id) => {
    const config = obtenerConfig(categoria);
    if (!config) return { success: false, error: 'Categoría de beneficio inválida.' };

    try {
        await api.delete(`${config.endpoint}/${encodeURIComponent(id)}`);
        return { success: true };
    } catch (error) {
        return manejarError(error, 'No se pudo eliminar el beneficio. Puede tener registros asociados.');
    }
};
