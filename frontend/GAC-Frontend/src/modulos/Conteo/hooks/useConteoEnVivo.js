import { useCallback, useEffect, useRef, useState } from 'react';
import { obtenerMovimientos, obtenerOcupacionActual, obtenerSensores } from '../services/conteoService';

const INTERVALO_MS = 5000;
const MOVIMIENTOS_RECIENTES = 10;

/**
 * Consulta ocupación actual, últimos movimientos y estado de los sensores,
 * y los refresca cada 5s.
 *
 * - `consultandoRef` evita peticiones solapadas: si una consulta todavía no
 *   terminó cuando toca la siguiente, esa vuelta se salta en vez de acumular
 *   peticiones en paralelo.
 * - `activoRef` evita setState después de desmontar el componente.
 * - El intervalo se crea una sola vez (effect sin dependencias que cambien
 *   entre renders) y siempre se limpia en el cleanup, evitando intervalos
 *   duplicados incluso con el doble-montaje de React StrictMode en dev.
 * - Un fallo de red NO borra los últimos datos buenos ya mostrados; solo
 *   agrega un aviso de error, para no reemplazar datos reales por vacíos.
 */
export function useConteoEnVivo() {
    const [ocupacion, setOcupacion] = useState(null);
    const [movimientos, setMovimientos] = useState([]);
    const [sensores, setSensores] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [ultimaActualizacion, setUltimaActualizacion] = useState(null);

    const activoRef = useRef(true);
    const consultandoRef = useRef(false);

    const consultar = useCallback(async () => {
        if (consultandoRef.current) return;
        consultandoRef.current = true;

        const [resultadoOcupacion, resultadoMovimientos, resultadoSensores] = await Promise.all([
            obtenerOcupacionActual(),
            obtenerMovimientos({ per_page: MOVIMIENTOS_RECIENTES }),
            obtenerSensores(),
        ]);

        consultandoRef.current = false;

        if (!activoRef.current) return;

        if (resultadoOcupacion.success && resultadoMovimientos.success) {
            setOcupacion(resultadoOcupacion.data);
            setMovimientos(resultadoMovimientos.data);
            setError('');
            setUltimaActualizacion(new Date());
        } else {
            setError(resultadoOcupacion.error || resultadoMovimientos.error);
        }

        if (resultadoSensores.success) {
            setSensores(resultadoSensores.data);
        }

        setCargando(false);
    }, []);

    useEffect(() => {
        activoRef.current = true;

        (async () => {
            await consultar();
        })();

        const intervalo = setInterval(consultar, INTERVALO_MS);

        return () => {
            activoRef.current = false;
            clearInterval(intervalo);
        };
    }, [consultar]);

    return { ocupacion, movimientos, sensores, cargando, error, ultimaActualizacion, reintentar: consultar };
}
