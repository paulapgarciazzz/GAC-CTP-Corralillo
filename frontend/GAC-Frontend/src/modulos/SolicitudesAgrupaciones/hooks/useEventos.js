import { useEffect, useState } from 'react';
import { obtenerEventos } from '../../Calendario/services/eventoService';
import { obtenerFechaLocalISO } from '../../../utils/fecha';

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
