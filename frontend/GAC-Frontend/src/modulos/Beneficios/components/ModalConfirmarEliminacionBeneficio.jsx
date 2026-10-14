import { AlertTriangle, Loader2, X } from 'lucide-react';
import { BENEFICIO_CONFIG } from '../services/beneficioService';

export default function ModalConfirmarEliminacionBeneficio({ categoria, beneficio, loading, error, onClose, onConfirm }) {
    if (!beneficio) return null;

    const config = BENEFICIO_CONFIG[categoria];
    const nombre = categoria === 'transporte'
        ? beneficio.matricula
        : beneficio.nombre ?? beneficio.nombre_ruta ?? beneficio.tiempo_comida;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={loading ? undefined : onClose}>
            <div role="dialog" aria-modal="true" aria-labelledby="titulo-confirmar-eliminacion-beneficio" onClick={(event) => event.stopPropagation()} className="w-full max-w-md bg-surface rounded-2xl shadow-2xl p-6 relative">
                <button type="button" onClick={onClose} disabled={loading} aria-label="Cerrar" className="absolute top-4 right-4 text-foreground-faint hover:text-foreground disabled:opacity-50 transition-colors cursor-pointer">
                    <X size={20} />
                </button>
                <div className="flex items-start gap-3 pr-8">
                    <div className="p-2 rounded-full bg-danger-soft text-danger shrink-0"><AlertTriangle size={20} /></div>
                    <div>
                        <h2 id="titulo-confirmar-eliminacion-beneficio" className="text-lg font-bold text-foreground">Eliminar beneficio</h2>
                        <p className="mt-3 text-sm text-foreground-soft">¿Seguro que deseas eliminar <strong className="text-foreground">{nombre}</strong>?</p>
                        <p className="mt-2 text-sm text-danger">Esta acción no se puede deshacer.</p>
                    </div>
                </div>
                {error && <div role="alert" className="mt-4 p-3 bg-danger-soft border border-danger/30 rounded-lg text-danger text-sm">{error}</div>}
                <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                    <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 border border-border text-foreground-soft hover:bg-background disabled:opacity-50 rounded-lg font-medium transition-colors cursor-pointer">Cancelar</button>
                    <button type="button" onClick={onConfirm} disabled={loading} className="px-4 py-2 bg-danger hover:bg-danger/90 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors cursor-pointer flex items-center justify-center gap-2">
                        {loading && <Loader2 size={16} className="animate-spin" />}
                        {loading ? 'Eliminando...' : `Eliminar ${config.label.toLowerCase().replace(/s$/, '')}`}
                    </button>
                </div>
            </div>
        </div>
    );
}
