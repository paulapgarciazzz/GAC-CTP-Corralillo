import { useEffect } from 'react';

const ENFOCABLES = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Modales abiertos, del más antiguo al más reciente: solo el último atrapa el foco.
const pila = [];
let overflowPrevio = '';

/**
 * Mantiene el foco dentro de `ref` mientras `activo` sea verdadero: lo mueve al
 * contenedor al abrir (salvo que un hijo ya lo tenga, p. ej. con autoFocus),
 * hace que Tab cicle dentro, bloquea el scroll del body y al cerrar devuelve
 * el foco al elemento que abrió el modal. El contenedor necesita tabIndex={-1}.
 */
export function useAtraparFoco(activo, ref) {
    useEffect(() => {
        const contenedor = ref.current;
        if (!activo || !contenedor) return;

        const previo = document.activeElement;
        const marca = {};

        if (pila.length === 0) {
            overflowPrevio = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
        }
        pila.push(marca);

        if (!contenedor.contains(document.activeElement)) contenedor.focus({ preventScroll: true });

        const handleKeyDown = (e) => {
            if (e.key !== 'Tab' || pila[pila.length - 1] !== marca) return;

            const elementos = [...contenedor.querySelectorAll(ENFOCABLES)].filter((el) => el.getClientRects().length > 0);
            if (elementos.length === 0) {
                e.preventDefault();
                return;
            }

            const primero = elementos[0];
            const ultimo = elementos[elementos.length - 1];
            const actual = document.activeElement;
            const fuera = !contenedor.contains(actual) || actual === contenedor;

            if (e.shiftKey && (actual === primero || fuera)) {
                e.preventDefault();
                ultimo.focus();
            } else if (!e.shiftKey && (actual === ultimo || fuera)) {
                e.preventDefault();
                primero.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            pila.splice(pila.indexOf(marca), 1);
            if (pila.length === 0) document.body.style.overflow = overflowPrevio;
            if (previo instanceof HTMLElement && previo.isConnected) previo.focus({ preventScroll: true });
        };
    }, [activo, ref]);
}
