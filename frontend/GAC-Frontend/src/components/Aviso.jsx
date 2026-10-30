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
        <div role={role} className={`px-4 py-3 border rounded-lg text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${clase} ${className}`}>
            <span>{mensaje}</span>
            {onReintentar && (
                <button type="button" onClick={onReintentar} className="inline-flex min-h-9 items-center justify-center gap-2 px-3 py-1.5 border border-danger/40 rounded-lg font-semibold hover:bg-danger/10 transition-colors cursor-pointer">
                    <RefreshCw size={14} aria-hidden="true" />Reintentar
                </button>
            )}
        </div>
    );
}
