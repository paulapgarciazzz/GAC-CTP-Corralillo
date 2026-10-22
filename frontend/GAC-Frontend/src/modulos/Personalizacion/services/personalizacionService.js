import api from '../../../services/axios';
import { manejarError } from '../../../services/manejoErrores';

// La instancia de axios fija Content-Type: application/json y, con ese
// encabezado, axios convierte un FormData en JSON y descarta los archivos.
// Con multipart/form-data axios envía el FormData tal cual y el navegador
// agrega el boundary.
export const MULTIPART = { headers: { 'Content-Type': 'multipart/form-data' } };

// FormData convierte los booleanos en "true"/"false", que la regla `boolean` de Laravel rechaza.
export const construirFormData = (datos) => {
    const formData = new FormData();

    Object.entries(datos).forEach(([clave, valor]) => {
        if (valor === undefined || valor === null) return;
        formData.append(clave, typeof valor === 'boolean' ? (valor ? '1' : '0') : valor);
    });

    return formData;
};

const pedir = async (peticion, mensajeError) => {
    try {
        const response = await peticion();
        return { success: true, data: response.data.data };
    } catch (error) {
        return manejarError(error, mensajeError);
    }
};

// Secciones: landing, correos, apariencia y contacto.
export const obtenerSeccion = (seccion) =>
    pedir(() => api.get(`/personalizacion/${seccion}`), 'No se pudo cargar la configuración.');

export const actualizarSeccion = (seccion, valores) =>
    pedir(() => api.put(`/personalizacion/${seccion}`, valores), 'No se pudieron guardar los cambios.');

export const subirImagen = (seccion, campo, archivo) =>
    pedir(
        () => api.post(`/personalizacion/${seccion}/imagenes/${campo}`, construirFormData({ imagen: archivo }), MULTIPART),
        'No se pudo subir la imagen.',
    );

export const restaurarImagen = (seccion, campo) =>
    pedir(() => api.delete(`/personalizacion/${seccion}/imagenes/${campo}`), 'No se pudo restaurar la imagen.');

export const vistaPreviaCorreo = (tipo, textos) =>
    pedir(() => api.post('/personalizacion/correos/vista-previa', { tipo, textos }), 'No se pudo generar la vista previa.');

// Fotos del Hero y de la galería.
export const obtenerFotos = (destino) =>
    pedir(() => api.get('/personalizacion/fotos', { params: { destino } }), 'No se pudieron cargar las fotos.');

export const crearFoto = (destino, archivo, titulo) =>
    pedir(
        () => api.post('/personalizacion/fotos', construirFormData({ destino, archivo, titulo: titulo || null }), MULTIPART),
        'No se pudo subir la foto.',
    );

export const actualizarFoto = (id, datos) => {
    const formData = construirFormData(datos);
    formData.append('_method', 'PUT');

    return pedir(
        () => api.post(`/personalizacion/fotos/${encodeURIComponent(id)}`, formData, MULTIPART),
        'No se pudo actualizar la foto.',
    );
};

export const eliminarFoto = async (id) => {
    try {
        await api.delete(`/personalizacion/fotos/${encodeURIComponent(id)}`);
        return { success: true };
    } catch (error) {
        return manejarError(error, 'No se pudo eliminar la foto.');
    }
};

export const reordenarFotos = async (fotos) => {
    try {
        await api.patch('/personalizacion/fotos/reordenar', { fotos });
        return { success: true };
    } catch (error) {
        return manejarError(error, 'No se pudo guardar el nuevo orden.');
    }
};
