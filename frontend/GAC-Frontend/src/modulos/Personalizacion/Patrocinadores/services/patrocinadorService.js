import api from '../../../../services/axios';
import { manejarError } from './manejoErrores';

const construirFormData = (datos) => {
    const formData = new FormData();

    Object.entries(datos).forEach(([clave, valor]) => {
        if (valor === undefined || valor === null) return;
        formData.append(clave, valor);
    });

    return formData;
};

export const obtenerPatrocinadores = async () => {
    try {
        const response = await api.get('/patrocinadores');
        return { success: true, data: response.data.data };
    } catch (error) {
        return manejarError(error, 'No se pudieron cargar los patrocinadores.');
    }
};

export const crearPatrocinador = async (datos) => {
    try {
        const response = await api.post('/patrocinadores', construirFormData(datos));
        return { success: true, data: response.data.data };
    } catch (error) {
        return manejarError(error, 'No se pudo crear el patrocinador.');
    }
};

export const actualizarPatrocinador = async (id, datos) => {
    try {
        const formData = construirFormData(datos);
        formData.append('_method', 'PUT');
        const response = await api.post(`/patrocinadores/${encodeURIComponent(id)}`, formData);
        return { success: true, data: response.data.data };
    } catch (error) {
        return manejarError(error, 'No se pudo actualizar el patrocinador.');
    }
};

export const eliminarPatrocinador = async (id) => {
    try {
        await api.delete(`/patrocinadores/${encodeURIComponent(id)}`);
        return { success: true };
    } catch (error) {
        return manejarError(error, 'No se pudo eliminar el patrocinador.');
    }
};

export const reordenarPatrocinadores = async (patrocinadores) => {
    try {
        await api.patch('/patrocinadores/reordenar', { patrocinadores });
        return { success: true };
    } catch (error) {
        return manejarError(error, 'No se pudo guardar el nuevo orden.');
    }
};

export const obtenerConfiguracionPatrocinadores = async () => {
    try {
        const response = await api.get('/configuracion-patrocinadores');
        return { success: true, data: response.data.data };
    } catch (error) {
        return manejarError(error, 'No se pudo cargar la configuración de la sección.');
    }
};

export const actualizarConfiguracionPatrocinadores = async (datos) => {
    try {
        const response = await api.put('/configuracion-patrocinadores', datos);
        return { success: true, data: response.data.data };
    } catch (error) {
        return manejarError(error, 'No se pudo actualizar la configuración de la sección.');
    }
};
