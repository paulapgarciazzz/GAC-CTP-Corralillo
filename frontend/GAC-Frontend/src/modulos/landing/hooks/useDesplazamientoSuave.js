import { useEffect } from 'react';

const prefiereMenosMovimiento = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

// Acelera al salir y frena al llegar (ease-in-out cúbica).
const suavizar = (t) => (t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2);

/**
 * Desplazamiento lento hacia las secciones de la landing al tocar enlaces internos (#inicio, #calendario...).
 * Respeta el scroll-margin-top de la sección, le pasa el foco al llegar (como el ancla nativa) y se
 * cancela si la persona desplaza por su cuenta. Con "reducir movimiento" el salto es inmediato.
 */
export function useDesplazamientoSuave() {
    useEffect(() => {
        let animacion = null;
        const cancelar = () => {
            if (animacion) cancelAnimationFrame(animacion);
            animacion = null;
        };

        const handleClick = (e) => {
            if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

            const enlace = e.target.closest?.('a[href^="#"]');
            const hash = enlace?.getAttribute('href');
            const destino = hash && hash.length > 1 ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
            if (!destino) return;

            e.preventDefault();
            cancelar();

            const margen = parseFloat(getComputedStyle(destino).scrollMarginTop) || 0;
            const inicio = window.scrollY;
            const fin = Math.max(0, destino.getBoundingClientRect().top + inicio - margen);
            const distancia = fin - inicio;

            const llegar = () => {
                if (!destino.hasAttribute('tabindex')) destino.setAttribute('tabindex', '-1');
                destino.focus({ preventScroll: true });
                // Conserva el estado del router y deja el ancla en la URL, como el enlace nativo.
                history.replaceState(history.state, '', hash);
            };

            if (prefiereMenosMovimiento() || Math.abs(distancia) < 2) {
                window.scrollTo(0, fin);
                llegar();
                return;
            }

            const duracion = Math.min(1400, Math.max(700, Math.abs(distancia) * 0.45));
            let comienzo = null;
            const paso = (ahora) => {
                comienzo ??= ahora;
                const progreso = Math.min(1, (ahora - comienzo) / duracion);
                window.scrollTo(0, inicio + distancia * suavizar(progreso));
                if (progreso < 1) {
                    animacion = requestAnimationFrame(paso);
                } else {
                    animacion = null;
                    llegar();
                }
            };
            animacion = requestAnimationFrame(paso);
        };

        document.addEventListener('click', handleClick);
        window.addEventListener('wheel', cancelar, { passive: true });
        window.addEventListener('touchstart', cancelar, { passive: true });
        window.addEventListener('keydown', cancelar);

        return () => {
            cancelar();
            document.removeEventListener('click', handleClick);
            window.removeEventListener('wheel', cancelar);
            window.removeEventListener('touchstart', cancelar);
            window.removeEventListener('keydown', cancelar);
        };
    }, []);
}
