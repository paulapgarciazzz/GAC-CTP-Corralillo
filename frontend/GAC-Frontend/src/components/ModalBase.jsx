import { useId, useRef } from 'react';
import { X } from 'lucide-react';
import { useCerrarConEscape } from '../hooks/useCerrarConEscape';
import { useAtraparFoco } from '../hooks/useAtraparFoco';
import { BOTON_CERRAR_MODAL_CLASS, MODAL_OVERLAY_CLASS, MODAL_PANEL_CLASS } from '../utils/modal';

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
    const panelRef = useRef(null);
    useCerrarConEscape(open, onClose, bloqueado);
    useAtraparFoco(open, panelRef);

    if (!open) return null;

    const alineacionTexto = alineacion === 'center' ? 'text-center' : 'pr-8';

    return (
        <div className={MODAL_OVERLAY_CLASS} onClick={bloqueado ? undefined : onClose}>
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titulo ? idTitulo : undefined}
                tabIndex={-1}
                onClick={(e) => e.stopPropagation()}
                className={`${MODAL_PANEL_CLASS} ${anchoMaximo} max-h-[90vh] overflow-y-auto p-6 sm:p-8`}
            >
                <button
                    type="button"
                    onClick={onClose}
                    disabled={bloqueado}
                    aria-label="Cerrar"
                    className={BOTON_CERRAR_MODAL_CLASS}
                >
                    <X size={20} aria-hidden="true" />
                </button>
                {titulo && (
                    <div className={`mb-6 ${alineacionTexto}`}>
                        <h2 id={idTitulo} className="text-xl sm:text-2xl font-semibold text-foreground">{titulo}</h2>
                        {subtitulo && <p className="mt-1 text-sm text-foreground-soft">{subtitulo}</p>}
                    </div>
                )}
                {children}
            </div>
        </div>
    );
}
