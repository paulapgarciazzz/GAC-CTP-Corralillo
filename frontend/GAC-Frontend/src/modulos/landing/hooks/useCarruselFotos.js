import { useCallback, useEffect, useState } from 'react';

const INTERVALO_MS = 6000;

// Con "reducir movimiento" activado el carrusel no avanza solo (WCAG 2.2.2).
const prefiereMenosMovimiento = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

/**
 * Estado del carrusel del Hero. Las fotos que fallan salen de la lista y el avance
 * automático solo pasa a fotos ya cargadas, para no dejar el fondo vacío. Cada cambio
 * de foto, manual o automático, reinicia el tiempo de la siguiente.
 */
export function useCarruselFotos(fotos) {
    const [estados, setEstados] = useState({});
    const [indiceGuardado, setIndice] = useState(0);
    const [pausado, setPausado] = useState(prefiereMenosMovimiento);

    const fotosValidas = fotos.filter((src) => estados[src] !== 'fallida');
    const total = fotosValidas.length;
    // Si cambia la cantidad de fotos, el índice se mantiene dentro del rango.
    const indice = total > 0 ? indiceGuardado % total : 0;

    const estaCargada = (src) => estados[src] === 'cargada';

    let siguienteCargada = null;
    for (let paso = 1; paso < total && siguienteCargada === null; paso += 1) {
        const candidata = (indice + paso) % total;
        if (estaCargada(fotosValidas[candidata])) siguienteCargada = candidata;
    }

    useEffect(() => {
        if (pausado || siguienteCargada === null) return undefined;
        const temporizador = setTimeout(() => setIndice(siguienteCargada), INTERVALO_MS);
        return () => clearTimeout(temporizador);
    }, [indice, pausado, siguienteCargada]);

    const marcarCargada = useCallback((src) => setEstados((previos) => ({ ...previos, [src]: 'cargada' })), []);
    const marcarFallida = useCallback((src) => setEstados((previos) => ({ ...previos, [src]: 'fallida' })), []);

    return {
        fotos: fotosValidas,
        indice,
        pausado,
        estaCargada,
        marcarCargada,
        marcarFallida,
        irA: setIndice,
        anterior: () => setIndice((indice - 1 + total) % total),
        siguiente: () => setIndice((indice + 1) % total),
        alternarPausa: () => setPausado((valor) => !valor),
    };
}
