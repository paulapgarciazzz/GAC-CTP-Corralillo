import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { obtenerActividadesDeEvento } from '../../Calendario/services/actividadService';

const SIN_RESULTADO = { clave: null, porEvento: new Map(), error: '' };

/**
 * Actividades programadas en `dia` para cada uno de `eventos`, agrupadas por id de evento.
 * Se consultan al abrir el día (siempre datos frescos); un evento cuya consulta
 * falló no aparece en `porEvento`.
 */
export function useActividadesDelDia(dia, eventos) {
    const [resultado, setResultado] = useState(SIN_RESULTADO);
    const fecha = format(dia, 'yyyy-MM-dd');
    const ids = eventos.map((evento) => evento.id).join(',');
    const clave = `${fecha}|${ids}`;

    useEffect(() => {
        if (!ids) return;
        let activo = true;
        const idsEventos = ids.split(',');

        Promise.all(idsEventos.map(obtenerActividadesDeEvento)).then((respuestas) => {
            if (!activo) return;
            const porEvento = new Map();
            let error = '';
            respuestas.forEach((respuesta, i) => {
                if (respuesta.success) {
                    porEvento.set(idsEventos[i], respuesta.data.filter((actividad) => actividad.fecha === fecha));
                } else {
                    error = respuesta.error;
                }
            });
            setResultado({ clave: `${fecha}|${ids}`, porEvento, error });
        });

        return () => {
            activo = false;
        };
    }, [fecha, ids]);

    const vigente = resultado.clave === clave;

    return {
        cargando: Boolean(ids) && !vigente,
        error: vigente ? resultado.error : '',
        actividadesDe: (idEvento) => (vigente ? resultado.porEvento.get(String(idEvento)) : undefined),
    };
}
