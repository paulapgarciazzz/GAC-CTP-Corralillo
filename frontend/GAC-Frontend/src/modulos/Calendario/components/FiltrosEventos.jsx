import { Search } from 'lucide-react';

const LABEL_CLASS = 'text-xs font-medium text-foreground-soft uppercase tracking-wider block whitespace-nowrap';
const FECHA_CLASS = 'w-full sm:w-40 px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary';

/**
 * Búsqueda por nombre + rango Desde/Hasta. Recibe el objeto de useFiltroEventos.
 */
export default function FiltrosEventos({ filtro, idPrefijo = 'eventos' }) {
    const { busqueda, setBusqueda, fechaDesde, setFechaDesde, fechaHasta, setFechaHasta } = filtro;

    return (
        <div className="bg-surface border border-border rounded-xl p-3 sm:p-4 flex flex-col gap-3 lg:flex-row lg:items-end">
            <div className="relative min-w-0 flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-faint" />
                <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar evento por nombre..."
                    className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-foreground-faint focus:outline-none focus:ring-2 focus:ring-primary"
                />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:flex sm:gap-3">
                <div className="space-y-1 min-w-0">
                    <label htmlFor={`${idPrefijo}-filtro-desde`} className={LABEL_CLASS}>
                        Desde
                    </label>
                    <input
                        id={`${idPrefijo}-filtro-desde`}
                        type="date"
                        value={fechaDesde}
                        onChange={(e) => setFechaDesde(e.target.value)}
                        className={FECHA_CLASS}
                    />
                </div>
                <div className="space-y-1 min-w-0">
                    <label htmlFor={`${idPrefijo}-filtro-hasta`} className={LABEL_CLASS}>
                        Hasta
                    </label>
                    <input
                        id={`${idPrefijo}-filtro-hasta`}
                        type="date"
                        value={fechaHasta}
                        onChange={(e) => setFechaHasta(e.target.value)}
                        className={FECHA_CLASS}
                    />
                </div>
            </div>
        </div>
    );
}
