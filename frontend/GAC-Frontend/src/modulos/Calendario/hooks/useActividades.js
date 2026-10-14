import { useMemo, useState } from 'react';
import { actualizarActividad, crearActividad, eliminarActividad } from '../services/actividadService';
import { useConfirmarEliminacion } from './useConfirmarEliminacion';

const SIN_ACTIVIDADES = [];

const compararActividades = (a, b) =>
    a.fecha.localeCompare(b.fecha) || a.hora_inicio.localeCompare(b.hora_inicio);

/**
 * Estado de las actividades del calendario agrupadas por evento y sus operaciones.
 */
export function useActividades() {
    const [actividades, setActividades] = useState([]);

    const actividadesPorEvento = useMemo(() => {
        const mapa = new Map();
        actividades.forEach((actividad) => {
            const lista = mapa.get(actividad.id_evento) ?? [];
            lista.push(actividad);
            mapa.set(actividad.id_evento, lista);
        });
        mapa.forEach((lista) => lista.sort(compararActividades));
        return mapa;
    }, [actividades]);

    const obtenerDeEvento = (idEvento) => actividadesPorEvento.get(idEvento) ?? SIN_ACTIVIDADES;

    /**
     * Crea (sin `actividad`) o actualiza una actividad del evento.
     */
    const guardarActividad = async ({ evento, actividad }, datos) => {
        const resultado = actividad
            ? await actualizarActividad(actividad.id_actividad, datos)
            : await crearActividad({ ...datos, id_evento: evento.id });

        if (resultado.success) {
            setActividades((prev) => (actividad
                ? prev.map((item) => (item.id_actividad === resultado.data.id_actividad ? resultado.data : item))
                : [...prev, resultado.data]));
        }

        return resultado;
    };

    // El backend elimina en cascada las actividades de un evento eliminado.
    const quitarActividadesDeEvento = (idEvento) => {
        setActividades((prev) => prev.filter((actividad) => actividad.id_evento !== idEvento));
    };

    const eliminacion = useConfirmarEliminacion(
        (actividad) => eliminarActividad(actividad.id_actividad),
        (actividad) => setActividades((prev) => prev.filter((item) => item.id_actividad !== actividad.id_actividad)),
    );

    return {
        obtenerDeEvento,
        establecerActividades: setActividades,
        guardarActividad,
        quitarActividadesDeEvento,
        eliminacion,
    };
}
