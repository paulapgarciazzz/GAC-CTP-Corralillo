import { useCallback, useEffect, useRef, useState } from 'react';

const ESPERA_BUSQUEDA_MS = 300;

/**
 * Listado paginado en el servidor con búsqueda (debounce) y cancelación de peticiones viejas.
 *
 * `obtener({ buscar, page, signal })` debe devolver `{ success, data, meta }` (ver usuarioService).
 * Con `acumular: true` cada página nueva se agrega a la anterior ("cargar más");
 * si no, la reemplaza (paginación clásica).
 */
export function useListadoPaginado(obtener, { acumular = false } = {}) {
    const [textoBusqueda, setTextoBusqueda] = useState('');
    const [consulta, setConsulta] = useState({ buscar: '', pagina: 1 });
    const [resultado, setResultado] = useState({ consulta: null, items: [], meta: null, error: '' });
    const temporizador = useRef(null);

    useEffect(() => {
        const controller = new AbortController();

        obtener({ buscar: consulta.buscar, page: consulta.pagina, signal: controller.signal }).then((r) => {
            if (r.cancelado) return;
            setResultado((prev) => ({
                consulta,
                items: !r.success ? prev.items
                    : acumular && consulta.pagina > 1 ? [...prev.items, ...r.data]
                        : r.data,
                meta: r.success ? r.meta : prev.meta,
                error: r.success ? '' : r.error,
            }));
        });

        return () => controller.abort();
    }, [consulta, obtener, acumular]);

    useEffect(() => () => window.clearTimeout(temporizador.current), []);

    const buscar = useCallback((texto) => {
        setTextoBusqueda(texto);
        window.clearTimeout(temporizador.current);
        temporizador.current = window.setTimeout(() => {
            setConsulta((prev) => (prev.buscar === texto.trim() ? prev : { buscar: texto.trim(), pagina: 1 }));
        }, ESPERA_BUSQUEDA_MS);
    }, []);

    const limpiarBusqueda = useCallback(() => {
        window.clearTimeout(temporizador.current);
        setTextoBusqueda('');
        setConsulta({ buscar: '', pagina: 1 });
    }, []);

    const irAPagina = useCallback((pagina) => setConsulta((prev) => ({ ...prev, pagina })), []);
    const cargarMas = useCallback(() => setConsulta((prev) => ({ ...prev, pagina: prev.pagina + 1 })), []);
    // Un objeto nuevo vuelve a disparar la petición aunque los valores no cambien.
    const recargar = useCallback(() => setConsulta((prev) => ({ ...prev, pagina: 1 })), []);

    // Reemplaza un elemento en memoria sin volver a pedir la lista.
    const actualizarItem = useCallback((item) => {
        setResultado((prev) => ({ ...prev, items: prev.items.map((i) => (i.id === item.id ? item : i)) }));
    }, []);

    const cargando = resultado.consulta !== consulta;
    const { meta } = resultado;

    return {
        items: resultado.items,
        meta,
        error: resultado.error,
        cargandoInicial: cargando && (consulta.pagina === 1 || !acumular),
        cargandoMas: cargando && acumular && consulta.pagina > 1,
        hayMas: Boolean(meta && meta.current_page < meta.last_page),
        textoBusqueda,
        busquedaActiva: consulta.buscar,
        buscar,
        limpiarBusqueda,
        irAPagina,
        cargarMas,
        recargar,
        actualizarItem,
    };
}
