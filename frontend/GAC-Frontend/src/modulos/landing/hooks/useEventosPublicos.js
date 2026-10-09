import { useEffect, useState } from 'react';
import { obtenerEventos } from '../../Calendario/services/eventoService';

const ESTADO_INICIAL = { eventos: [], cargando: true, error: '' };

/**
 * Eventos activos del calendario institucional para la vista pública.
 * Se vuelven a consultar al regresar a la pestaña, para reflejar los cambios
 * hechos desde el dashboard sin recargar la página.
 */
export function useEventosPublicos() {
    const [estado, setEstado] = useState(ESTADO_INICIAL);
    const [version, setVersion] = useState(0);

    useEffect(() => {
        let activo = true;

        obtenerEventos().then((resultado) => {
            if (!activo) return;
            setEstado((prev) => (resultado.success
                ? { eventos: resultado.data.filter((evento) => evento.activo), cargando: false, error: '' }
                : { ...prev, cargando: false, error: resultado.error }));
        });

        return () => {
            activo = false;
        };
    }, [version]);

    useEffect(() => {
        const alVolverALaPestana = () => {
            if (document.visibilityState === 'visible') setVersion((v) => v + 1);
        };
        document.addEventListener('visibilitychange', alVolverALaPestana);
        return () => document.removeEventListener('visibilitychange', alVolverALaPestana);
    }, []);

    const recargar = () => {
        setEstado((prev) => ({ ...prev, cargando: true, error: '' }));
        setVersion((v) => v + 1);
    };

    return { ...estado, recargar };
}
