import { useId } from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';
import { useCerrarConEscape } from '../hooks/useCerrarConEscape';

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
    useCerrarConEscape(open, onClose, loading);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={loading ? undefined : onClose}>
            <div role="dialog" aria-modal="true" aria-labelledby={idTitulo} onClick={(event) => event.stopPropagation()} className="w-full max-w-md bg-surface rounded-2xl shadow-2xl p-6 relative">
                <button type="button" onClick={onClose} disabled={loading} aria-label="Cerrar" className="absolute top-4 right-4 text-foreground-faint hover:text-foreground disabled:opacity-50 transition-colors cursor-pointer">
                    <X size={20} />
                </button>
                <div className="flex items-start gap-3 pr-8">
                    <div className="p-2 rounded-full bg-danger-soft text-danger shrink-0"><AlertTriangle size={20} /></div>
                    <div className="min-w-0">
                        <h2 id={idTitulo} className="text-lg font-bold text-foreground">{titulo}</h2>
                        <p className="mt-3 text-sm text-foreground-soft wrap-break-word">¿Seguro que deseas eliminar <strong className="text-foreground">{nombre}</strong>?</p>
                        {typeof advertencia === 'string' && <p className="mt-2 text-sm text-foreground-soft">{advertencia}</p>}
                        <p className="mt-2 text-sm text-danger">Esta acción no se puede deshacer.</p>
                    </div>
                </div>
                {advertencia && typeof advertencia !== 'string' && <div className="mt-4">{advertencia}</div>}
                {error && <div role="alert" className="mt-4 p-3 bg-danger-soft border border-danger/30 rounded-lg text-danger text-sm">{error}</div>}
                <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                    <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 border border-border text-foreground-soft hover:bg-background disabled:opacity-50 rounded-lg font-medium transition-colors cursor-pointer">Cancelar</button>
                    <button type="button" onClick={onConfirm} disabled={loading} className="px-4 py-2 bg-danger hover:bg-danger/90 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors cursor-pointer flex items-center justify-center gap-2">
                        {loading && <Loader2 size={16} className="animate-spin" />}
                        {loading ? 'Eliminando...' : textoBoton}
                    </button>
                </div>
            </div>
        </div>
    );
}
