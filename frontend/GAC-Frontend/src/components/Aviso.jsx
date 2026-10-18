import { RefreshCw } from 'lucide-react';

const ESTILOS = {
    error: { role: 'alert', clase: 'bg-danger-soft border-danger/30 text-danger' },
    exito: { role: 'status', clase: 'bg-success-soft border-success/30 text-success' },
};

/**
 * Banner de error o éxito. No renderiza nada si `mensaje` está vacío.
 * `onReintentar` (opcional) agrega el botón "Reintentar".
 */
export default function Aviso({ tipo = 'error', mensaje, onReintentar, className = '' }) {
    if (!mensaje) return null;
    const { role, clase } = ESTILOS[tipo] ?? ESTILOS.error;

    return (
        <div role={role} className={`p-3 border rounded-lg text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${clase} ${className}`}>
            <span>{mensaje}</span>
            {onReintentar && (
                <button type="button" onClick={onReintentar} className="inline-flex items-center justify-center gap-2 px-3 py-1.5 border border-danger/40 rounded-lg font-medium hover:bg-danger/10 transition-colors cursor-pointer">
                    <RefreshCw size={14} />Reintentar
                </button>
            )}
        </div>
    );
}
