import { formatearRangoEvento } from '../../Calendario/lib/fechas';

/**
 * Selector de evento para filtrar reportes. `value` vacío = todos los eventos.
 */
export default function SelectEventoReporte({ id = 'reporte-evento', eventos, cargando, value, onChange }) {
    return (
        <div className="print:hidden space-y-1 w-full sm:max-w-md">
            <label htmlFor={id} className="text-xs font-medium text-foreground-soft uppercase tracking-wider block">
                Evento
            </label>
            <select
                id={id}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={cargando}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed"
            >
                <option value="">{cargando ? 'Cargando eventos...' : 'Todos los eventos'}</option>
                {eventos.map((evento) => (
                    <option key={evento.id} value={evento.id}>
                        {evento.title} ({formatearRangoEvento(evento)})
                    </option>
                ))}
            </select>
        </div>
    );
}
