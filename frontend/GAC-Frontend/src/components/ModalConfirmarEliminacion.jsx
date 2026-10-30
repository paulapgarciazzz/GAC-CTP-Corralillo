import { useId, useRef } from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';
import { useCerrarConEscape } from '../hooks/useCerrarConEscape';
import { useAtraparFoco } from '../hooks/useAtraparFoco';
import { BOTON_CERRAR_MODAL_CLASS, MODAL_OVERLAY_CLASS, MODAL_PANEL_CLASS } from '../utils/modal';

/**
 * Confirmación de eliminación común a todos los módulos. Se combina con
 * useConfirmarEliminacion (src/hooks). `advertencia` admite texto o JSX para
 * explicar qué más se borra; mientras `loading` no se puede cerrar.
 */
export default function ModalConfirmarEliminacion({
    open,
    titulo,
    nombre,
    advertencia,
    textoBoton = 'Eliminar',
    loading = false,
    error,
    onClose,
    onConfirm,
}) {
    const idTitulo = useId();
    const panelRef = useRef(null);
    useCerrarConEscape(open, onClose, loading);
    useAtraparFoco(open, panelRef);

    if (!open) return null;

    return (
        <div className={MODAL_OVERLAY_CLASS} onClick={loading ? undefined : onClose}>
            <div ref={panelRef} role="alertdialog" aria-modal="true" aria-labelledby={idTitulo} tabIndex={-1} onClick={(event) => event.stopPropagation()} className={`${MODAL_PANEL_CLASS} max-w-md p-6`}>
                <button type="button" onClick={onClose} disabled={loading} aria-label="Cerrar" className={BOTON_CERRAR_MODAL_CLASS}>
                    <X size={20} aria-hidden="true" />
                </button>
                <div className="flex items-start gap-3 pr-8">
                    <div className="p-2 rounded-full bg-danger-soft text-danger shrink-0"><AlertTriangle size={20} aria-hidden="true" /></div>
                    <div className="min-w-0">
                        <h2 id={idTitulo} className="text-lg font-semibold text-foreground">{titulo}</h2>
                        <p className="mt-3 text-sm text-foreground-soft wrap-break-word">¿Seguro que deseas eliminar <strong className="text-foreground">{nombre}</strong>?</p>
                        {typeof advertencia === 'string' && <p className="mt-2 text-sm text-foreground-soft">{advertencia}</p>}
                        <p className="mt-2 text-sm font-medium text-danger">Esta acción no se puede deshacer.</p>
                    </div>
                </div>
                {advertencia && typeof advertencia !== 'string' && <div className="mt-4">{advertencia}</div>}
                {error && <div role="alert" className="mt-4 p-3 bg-danger-soft border border-danger/30 rounded-lg text-danger text-sm">{error}</div>}
                <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                    <button type="button" onClick={onClose} disabled={loading} className="min-h-10 px-4 py-2 border border-border-input bg-surface text-foreground hover:bg-surface-soft disabled:opacity-50 rounded-lg font-semibold text-sm transition-colors cursor-pointer">Cancelar</button>
                    <button type="button" onClick={onConfirm} disabled={loading} className="min-h-10 px-4 py-2 bg-danger hover:bg-danger/90 disabled:opacity-60 disabled:cursor-not-allowed text-on-danger rounded-lg font-semibold text-sm shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2">
                        {loading && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
                        {loading ? 'Eliminando...' : textoBoton}
                    </button>
                </div>
            </div>
        </div>
    );
}
