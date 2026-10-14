import { useMemo, useState } from 'react';

/**
 * Filtro de eventos por nombre y rango de fechas. Un evento entra en el rango
 * si se solapa con él. Devuelve los eventos ordenados por fecha de inicio.
 */
export function useFiltroEventos(events) {
    const [busqueda, setBusqueda] = useState('');
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');

    const eventosFiltrados = useMemo(() => {
        const desde = fechaDesde ? new Date(`${fechaDesde}T00:00:00`) : null;
        const hasta = fechaHasta ? new Date(`${fechaHasta}T23:59:59`) : null;
        const texto = busqueda.trim().toLowerCase();

        return events
            .filter((evento) => {
                if (texto && !evento.title.toLowerCase().includes(texto)) return false;
                if (desde && evento.end < desde) return false;
                if (hasta && evento.start > hasta) return false;
                return true;
            })
            .sort((a, b) => a.start - b.start);
    }, [events, busqueda, fechaDesde, fechaHasta]);

    return {
        busqueda,
        setBusqueda,
        fechaDesde,
        setFechaDesde,
        fechaHasta,
        setFechaHasta,
        eventosFiltrados,
    };
}
