import { AlertTriangle, Loader2 } from 'lucide-react';
import ModalBase from './ModalBase';
import { AlertaError } from './Formulario';

export default function ModalConfirmarEliminacion({ open, titulo, nombre, advertencia, textoBoton = 'Eliminar', loading, error, onClose, onConfirm }) {
    return (
        <ModalBase open={open} anchoMaximo="max-w-md" bloqueado={loading} onClose={onClose}>
            <div className="flex items-start gap-3 pr-8">
                <div className="p-2 rounded-full bg-danger-soft text-danger shrink-0">
                    <AlertTriangle size={20} />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-foreground">{titulo}</h2>
                    <p className="mt-3 text-sm text-foreground-soft">
                        ¿Seguro que deseas eliminar <strong className="text-foreground">'{nombre}'</strong>?
                    </p>
                    {advertencia && <p className="mt-2 text-sm text-foreground-soft">{advertencia}</p>}
                    <p className="mt-2 text-sm text-danger">Esta acción no se puede deshacer.</p>
                </div>
            </div>

            {error && <div className="mt-4"><AlertaError mensaje={error} /></div>}

            <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 border border-border text-foreground-soft hover:bg-background disabled:opacity-50 rounded-lg font-medium transition-colors cursor-pointer">
                    Cancelar
                </button>
                <button type="button" onClick={onConfirm} disabled={loading} className="px-4 py-2 bg-danger hover:bg-danger/90 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors cursor-pointer flex items-center justify-center gap-2">
                    {loading && <Loader2 size={16} className="animate-spin" />}
                    {loading ? 'Eliminando...' : textoBoton}
                </button>
            </div>
        </ModalBase>
    );
}
