import { useEffect, useState } from 'react';
import { usePersonalizacion } from '../publico/usePersonalizacion';
import {
    actualizarSeccion,
    obtenerSeccion,
    restaurarImagen as restaurarImagenApi,
    subirImagen as subirImagenApi,
} from '../services/personalizacionService';

/**
 * Carga y guarda una sección de Personalización (landing, correos,
 * apariencia o contacto). `valores` es el estado editable del formulario;
 * `restaurarTextos` lo llena con los predeterminados, pero no guarda hasta
 * que se presione "Guardar". Tras cada cambio se recarga la personalización
 * pública para que la landing y el panel reflejen el resultado.
 */
export function useSeccionPersonalizacion(seccion) {
    const { recargar } = usePersonalizacion();
    const [datos, setDatos] = useState(null);
    const [valores, setValores] = useState({});
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');
    const [errores, setErrores] = useState({});
    const [mensajeExito, setMensajeExito] = useState('');

    const aplicar = (respuesta) => {
        setDatos(respuesta);
        setValores(respuesta.valores);
    };

    const mostrarExito = (mensaje) => {
        setMensajeExito(mensaje);
        window.setTimeout(() => setMensajeExito(''), 3500);
    };

    const cargar = async () => {
        setCargando(true);
        setError('');
        const resultado = await obtenerSeccion(seccion);
        if (resultado.success) aplicar(resultado.data);
        else setError(resultado.error);
        setCargando(false);
    };

    useEffect(() => {
        let activo = true;

        obtenerSeccion(seccion).then((resultado) => {
            if (!activo) return;
            if (resultado.success) aplicar(resultado.data);
            else setError(resultado.error);
            setCargando(false);
        });

        return () => {
            activo = false;
        };
    }, [seccion]);

    const actualizarCampo = (campo, valor) => setValores((prev) => ({ ...prev, [campo]: valor }));

    const guardar = async () => {
        setGuardando(true);
        setError('');
        setErrores({});

        const resultado = await actualizarSeccion(seccion, valores);
        setGuardando(false);

        if (resultado.success) {
            aplicar(resultado.data);
            mostrarExito('Cambios guardados correctamente.');
            recargar();
        } else {
            setError(resultado.error);
            setErrores(resultado.errors ?? {});
        }

        return resultado;
    };

    const restaurarTextos = () => {
        setValores(datos.predeterminados);
        setErrores({});
    };

    // Imágenes: se guardan al instante (no dependen del botón "Guardar").
    const conImagen = async (peticion, mensaje) => {
        setError('');
        const resultado = await peticion();

        if (resultado.success) {
            // Conserva los textos que se están editando.
            setDatos(resultado.data);
            mostrarExito(mensaje);
            recargar();
        } else {
            setError(resultado.error);
        }

        return resultado;
    };

    const subirImagen = (campo, archivo) =>
        conImagen(() => subirImagenApi(seccion, campo, archivo), 'Imagen actualizada correctamente.');

    const restaurarImagen = (campo) =>
        conImagen(() => restaurarImagenApi(seccion, campo), 'Se restauró la imagen predeterminada.');

    return {
        datos,
        valores,
        setValores,
        actualizarCampo,
        cargando,
        guardando,
        error,
        errores,
        mensajeExito,
        cargar,
        guardar,
        restaurarTextos,
        subirImagen,
        restaurarImagen,
    };
}
