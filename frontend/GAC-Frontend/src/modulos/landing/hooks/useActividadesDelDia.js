import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { obtenerActividadesDeEvento } from '../../Calendario/services/actividadService';

const SIN_RESULTADO = { clave: null, porEvento: new Map() };

/**
 * Actividades programadas en `dia` para cada uno de `eventos`, agrupadas por id de evento.
 * Se consultan al abrir el día (siempre datos frescos); un evento cuya consulta
 * falló no aparece en `porEvento`, así que `actividadesDe` devuelve `undefined`.
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
            respuestas.forEach((respuesta, i) => {
                if (respuesta.success) {
                    porEvento.set(idsEventos[i], respuesta.data.filter((actividad) => actividad.fecha === fecha));
                }
            });
            setResultado({ clave: `${fecha}|${ids}`, porEvento });
        });

        return () => {
            activo = false;
        };
    }, [fecha, ids]);

    const vigente = resultado.clave === clave;

    return {
        cargando: Boolean(ids) && !vigente,
        actividadesDe: (idEvento) => (vigente ? resultado.porEvento.get(String(idEvento)) : undefined),
    };
}
