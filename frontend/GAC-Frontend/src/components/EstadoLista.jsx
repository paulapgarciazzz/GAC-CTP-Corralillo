import { Loader2 } from 'lucide-react';

/** Spinner centrado para cuando una lista o página está cargando. */
export function EstadoCargando({ texto = 'Cargando...' }) {
    return (
        <div role="status" className="flex items-center justify-center gap-2 py-16 text-foreground-soft">
            <Loader2 className="animate-spin text-primary" size={24} aria-hidden="true" />{texto}
        </div>
    );
}

/**
 * Esqueleto de una lista o tabla mientras carga: barra de herramientas + filas.
 * El texto solo lo oyen los lectores de pantalla; los bloques son decorativos.
 */
export function EsqueletoLista({ texto = 'Cargando...', filas = 6 }) {
    return (
        <div role="status" className="overflow-hidden rounded-xl border border-border bg-surface">
            <span className="sr-only">{texto}</span>
            <div aria-hidden="true">
                <div className="flex items-center gap-3 border-b border-border bg-surface-soft px-4 py-3">
                    <span className="esqueleto h-3 w-1/4" />
                    <span className="esqueleto ml-auto h-3 w-1/6" />
                </div>
                {Array.from({ length: filas }, (_, i) => (
                    <div key={i} className="flex items-center gap-4 border-b border-border px-4 py-4 last:border-b-0">
                        <span className="esqueleto h-9 w-9 shrink-0 rounded-full" />
                        <span className="flex flex-1 flex-col gap-2">
                            <span className="esqueleto h-3" style={{ width: `${70 - (i % 3) * 15}%` }} />
                            <span className="esqueleto h-2.5 w-1/3" />
                        </span>
                        <span className="esqueleto hidden h-7 w-20 rounded-full sm:block" />
                    </div>
                ))}
            </div>
        </div>
    );
}

/** Esqueleto de una vista completa del panel (título, filtros y lista) mientras se descarga. */
export function EsqueletoVista({ texto = 'Cargando...' }) {
    return (
        <div className="space-y-6">
            <div aria-hidden="true" className="space-y-3">
                <span className="esqueleto block h-7 w-64 max-w-full" />
                <span className="esqueleto block h-4 w-96 max-w-full" />
            </div>
            <div aria-hidden="true" className="flex flex-wrap gap-3">
                <span className="esqueleto block h-10 w-full sm:w-72" />
                <span className="esqueleto block h-10 w-32" />
            </div>
            <EsqueletoLista texto={texto} />
        </div>
    );
}

/** Caja para una lista sin resultados. */
export function EstadoVacio({ mensaje }) {
    return (
        <div className="flex items-center justify-center py-16 px-4 border border-dashed border-border rounded-xl bg-surface">
            <p className="text-sm text-foreground-soft text-center">{mensaje}</p>
        </div>
    );
}
