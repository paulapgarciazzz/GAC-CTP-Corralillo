import { useId } from 'react';
import { X } from 'lucide-react';
import { useCerrarConEscape } from '../hooks/useCerrarConEscape';

/**
 * Estructura común de los modales del calendario: fondo, caja, botón cerrar y título.
 * `bloqueado` impide cerrarlo (Escape, click afuera o X) mientras hay una operación en curso.
 */
export default function ModalBase({
    open = true,
    titulo,
    subtitulo,
    alineacion = 'center',
    anchoMaximo = 'max-w-lg',
    bloqueado = false,
    onClose,
    children,
}) {
    const idTitulo = useId();
    useCerrarConEscape(open, onClose, bloqueado);

    if (!open) return null;

    const alineacionTexto = alineacion === 'center' ? 'text-center' : 'pr-8';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={bloqueado ? undefined : onClose}>
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={titulo ? idTitulo : undefined}
                onClick={(e) => e.stopPropagation()}
                className={`w-full ${anchoMaximo} max-h-[90vh] overflow-y-auto bg-surface rounded-2xl shadow-2xl p-6 sm:p-8 relative`}
            >
                <button
                    type="button"
                    onClick={onClose}
                    disabled={bloqueado}
                    aria-label="Cerrar"
                    className="absolute top-4 right-4 text-foreground-faint hover:text-foreground disabled:opacity-50 transition-colors cursor-pointer"
                >
                    <X size={22} />
                </button>
                {titulo && (
                    <div className={`mb-6 ${alineacionTexto}`}>
                        <h2 id={idTitulo} className="text-xl sm:text-2xl font-bold text-primary">{titulo}</h2>
                        {subtitulo && <p className="mt-1 text-sm text-foreground-soft">{subtitulo}</p>}
                    </div>
                )}
                {children}
            </div>
        </div>
    );
}
