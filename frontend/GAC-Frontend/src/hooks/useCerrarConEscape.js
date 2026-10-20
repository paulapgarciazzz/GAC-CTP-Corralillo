import { useEffect } from 'react';

/**
 * Llama a onClose al presionar Escape mientras `activo` sea verdadero.
 * Con `bloqueado` (por ejemplo, mientras se guarda) la tecla se ignora.
 */
export function useCerrarConEscape(activo, onClose, bloqueado = false) {
    useEffect(() => {
        if (!activo) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && !bloqueado) onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [activo, bloqueado, onClose]);
}
