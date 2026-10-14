import { useState } from 'react';

/**
 * Estado del flujo "confirmar y eliminar" para usar con ModalConfirmarEliminacion.
 * `eliminar(elemento)` debe devolver `{ success, error }`; `onEliminado(elemento)` se llama al terminar bien.
 */
export function useConfirmarEliminacion(eliminar, onEliminado) {
    const [elemento, setElemento] = useState(null);
    const [eliminando, setEliminando] = useState(false);
    const [error, setError] = useState('');

    const abrir = (nuevoElemento) => {
        setError('');
        setElemento(nuevoElemento);
    };

    const cerrar = () => {
        if (eliminando) return;
        setElemento(null);
        setError('');
    };

    const confirmar = async () => {
        if (!elemento || eliminando) return;
        setEliminando(true);
        setError('');
        const resultado = await eliminar(elemento);
        setEliminando(false);

        if (!resultado.success) {
            setError(resultado.error);
            return;
        }

        setElemento(null);
        onEliminado(elemento);
    };

    return { elemento, eliminando, error, abrir, cerrar, confirmar };
}
