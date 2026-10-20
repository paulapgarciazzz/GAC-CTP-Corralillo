import { Loader2 } from 'lucide-react';

/** Spinner centrado para cuando una lista o página está cargando. */
export function EstadoCargando({ texto = 'Cargando...' }) {
    return (
        <div className="flex items-center justify-center gap-2 py-16 text-foreground-soft">
            <Loader2 className="animate-spin text-primary" size={24} />{texto}
        </div>
    );
}

/** Caja para una lista sin resultados. */
export function EstadoVacio({ mensaje }) {
    return (
        <div className="flex items-center justify-center py-16 border border-border rounded-xl bg-surface">
            <p className="text-sm text-foreground-faint text-center">{mensaje}</p>
        </div>
    );
}
