import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Search, CalendarPlus, Pencil, Trash2 } from 'lucide-react';
import { CATEGORY_COLORS } from '../lib/categorias';

export default function TablaEventos({ events, cargando, onCreateClick, onEdit, onDelete }) {
    const [busqueda, setBusqueda] = useState('');
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');

    const eventosFiltrados = useMemo(() => {
        const desde = fechaDesde ? new Date(`${fechaDesde}T00:00:00`) : null;
        const hasta = fechaHasta ? new Date(`${fechaHasta}T23:59:59`) : null;
        const texto = busqueda.trim().toLowerCase();

        return events
            .filter((evento) => {
                if (texto && !evento.title.toLowerCase().includes(texto)) return false;
                if (desde && evento.end < desde) return false;
                if (hasta && evento.start > hasta) return false;
                return true;
            })
            .sort((a, b) => a.start - b.start);
    }, [events, busqueda, fechaDesde, fechaHasta]);

    const handleDelete = (evento) => {
        if (window.confirm(`¿Eliminar el evento "${evento.title}"?`)) {
            onDelete(evento.id);
        }
    };

    return (
        <div className="mx-auto w-full max-w-5xl space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-lg font-semibold text-foreground">Eventos</h3>
                <button
                    type="button"
                    onClick={onCreateClick}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md transition duration-300 hover:bg-primary-hover hover:shadow-lg cursor-pointer"
                >
                    <CalendarPlus size={16} />
                    Crear evento
                </button>
            </div>

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
                        <label htmlFor="eventos-filtro-desde" className="text-xs font-medium text-foreground-soft uppercase tracking-wider block whitespace-nowrap">
                            Desde
                        </label>
                        <input
                            id="eventos-filtro-desde"
                            type="date"
                            value={fechaDesde}
                            onChange={(e) => setFechaDesde(e.target.value)}
                            className="w-full sm:w-40 px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div className="space-y-1 min-w-0">
                        <label htmlFor="eventos-filtro-hasta" className="text-xs font-medium text-foreground-soft uppercase tracking-wider block whitespace-nowrap">
                            Hasta
                        </label>
                        <input
                            id="eventos-filtro-hasta"
                            type="date"
                            value={fechaHasta}
                            onChange={(e) => setFechaHasta(e.target.value)}
                            className="w-full sm:w-40 px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>
            </div>

            {eventosFiltrados.length === 0 ? (
                <div className="flex items-center justify-center py-12 border border-border rounded-xl bg-surface">
                    <p className="text-sm text-foreground-faint text-center">
                        {cargando ? 'Cargando eventos...' : 'No se encontraron eventos con esos criterios.'}
                    </p>
                </div>
            ) : (
                <div className="bg-surface border border-border rounded-xl overflow-x-auto">
                    <table className="w-full min-w-[860px] text-sm">
                        <thead className="bg-background border-b border-border">
                            <tr className="text-left text-xs uppercase tracking-wider text-foreground-faint">
                                <th className="px-4 py-3 font-semibold">Evento</th>
                                <th className="px-4 py-3 font-semibold">Fecha inicio</th>
                                <th className="px-4 py-3 font-semibold">Hora inicio</th>
                                <th className="px-4 py-3 font-semibold">Fecha fin</th>
                                <th className="px-4 py-3 font-semibold">Hora fin</th>
                                <th className="px-4 py-3 font-semibold text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {eventosFiltrados.map((evento) => {
                                const colors = CATEGORY_COLORS[evento.category] || CATEGORY_COLORS.info;
                                return (
                                    <tr key={evento.id} className="hover:bg-background/60 transition-colors">
                                        <td className="px-4 py-4">
                                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ${colors.bg} ${colors.text}`}>
                                                {evento.title}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-foreground-soft whitespace-nowrap">
                                            {format(evento.start, "d MMM yyyy", { locale: es })}
                                        </td>
                                        <td className="px-4 py-4 text-foreground-faint whitespace-nowrap">
                                            {evento.allDay ? 'Todo el día' : format(evento.start, 'HH:mm')}
                                        </td>
                                        <td className="px-4 py-4 text-foreground-soft whitespace-nowrap">
                                            {format(evento.end, "d MMM yyyy", { locale: es })}
                                        </td>
                                        <td className="px-4 py-4 text-foreground-faint whitespace-nowrap">
                                            {evento.allDay ? 'Todo el día' : format(evento.end, 'HH:mm')}
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex justify-end gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => onEdit(evento)}
                                                    aria-label={`Editar ${evento.title}`}
                                                    title="Editar"
                                                    className="rounded-md p-1.5 text-foreground-faint transition-colors hover:bg-primary/10 hover:text-primary cursor-pointer"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(evento)}
                                                    aria-label={`Eliminar ${evento.title}`}
                                                    title="Eliminar"
                                                    className="rounded-md p-1.5 text-foreground-faint transition-colors hover:bg-danger-soft hover:text-danger cursor-pointer"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
