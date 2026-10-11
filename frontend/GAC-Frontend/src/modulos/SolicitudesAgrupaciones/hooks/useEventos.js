import { useEffect, useMemo, useState } from 'react';
import { obtenerEventos } from '../../Calendario/services/eventoService';
import { obtenerFechaLocalISO } from '../../../utils/fecha';
import { aMinutos, crearFiltroHora } from '../../../utils/hora';

export function useEventos() {
    const [eventos, setEventos] = useState([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        let activo = true;
        obtenerEventos().then((resultado) => {
            if (!activo) return;
            setEventos(resultado.success ? resultado.data : []);
            setCargando(false);
        });
        return () => { activo = false; };
    }, []);

    return { eventos, cargando };
}

// Eventos activos que aún no han comenzado (posteriores a la fecha actual),
// ordenados por fecha. `idIncluido` conserva el evento ya asignado al editar.
export function filtrarEventosProximos(eventos, idIncluido = null) {
    const hoy = obtenerFechaLocalISO();
    return eventos
        .filter((e) => (e.activo && e.fechaInicio > hoy) || String(e.id) === String(idIncluido))
        .sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio));
}

/**
 * Rango de fecha y hora en el que se puede solicitar participar en el evento elegido (`null` si no hay evento).
 * Vacía `fecha_solicitada` y `hora_solicitada` cuando quedan fuera del rango: al cambiar de evento
 * o al cargar una solicitud existente.
 */
export function useRangoEvento(eventos, idEvento, setValores) {
    const evento = eventos.find((e) => String(e.id) === String(idEvento));

    const rango = useMemo(() => (evento ? {
        fechaMin: evento.fechaInicio,
        fechaMax: evento.fechaFin,
        horaDesde: evento.horaInicio,
        horaHasta: evento.horaFin,
    } : null), [evento]);

    useEffect(() => {
        if (!rango) return;

        const filtro = crearFiltroHora(rango.horaDesde, rango.horaHasta);
        setValores((prev) => {
            const { fecha_solicitada: fecha, hora_solicitada: hora } = prev;
            const fechaFuera = fecha && (fecha < rango.fechaMin || fecha > rango.fechaMax);
            const horaFuera = hora && filtro && !filtro(aMinutos(hora));
            if (!fechaFuera && !horaFuera) return prev;

            return {
                ...prev,
                ...(fechaFuera && { fecha_solicitada: '' }),
                ...(horaFuera && { hora_solicitada: '' }),
            };
        });
    }, [rango, setValores]);

    return rango;
}
