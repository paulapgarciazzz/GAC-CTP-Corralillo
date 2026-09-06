import api from '../../../services/axios';

const extraerMensajeError = (error, fallback) =>
    error.response?.data?.message
    || Object.values(error.response?.data?.errors || {})[0]?.[0]
    || fallback;

export const buscarEncargadoConAgrupaciones = async (cedula) => {
    try {
        const [encargadoResponse, agrupacionesResponse] = await Promise.all([
            api.get(`/encargados/${cedula}`),
            api.get(`/encargados/${cedula}/agrupaciones`),
        ]);

        return {
            success: true,
            encargado: encargadoResponse.data.data,
            agrupaciones: agrupacionesResponse.data.data,
        };
    } catch (error) {
        if (error.response?.status === 404) {
            return { success: false, notFound: true };
        }
        const mensaje = extraerMensajeError(error, 'No se pudo buscar al encargado. Intenta de nuevo.');
        return { success: false, error: mensaje };
    }
};

export const actualizarEncargado = async (cedula, datosParciales) => {
    try {
        const response = await api.patch(`/encargados/${cedula}`, datosParciales);
        return { success: true, data: response.data.data };
    } catch (error) {
        const mensaje = extraerMensajeError(error, 'No se pudieron actualizar los datos del encargado.');
        return { success: false, error: mensaje };
    }
};
