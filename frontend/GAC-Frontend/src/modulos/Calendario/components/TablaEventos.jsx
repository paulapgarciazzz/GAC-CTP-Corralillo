import { Fragment, useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarPlus, ChevronDown, ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react';
import { CATEGORY_COLORS } from '../lib/categorias';
import { useFiltroEventos } from '../hooks/useFiltroEventos';
import FiltrosEventos from './FiltrosEventos';
import TablaActividades from './TablaActividades';

export default function TablaEventos({
    events,
    cargando,
    onCreateClick,
    onEdit,
    onDelete,
    actividadesDeEvento,
    onAddActividad,
    onEditActividad,
    onDeleteActividad,
}) {
    const filtro = useFiltroEventos(events);
    const { eventosFiltrados } = filtro;
    const [expandidos, setExpandidos] = useState(() => new Set());

    const alternarExpandido = (id) => {
        setExpandidos((prev) => {
            const siguiente = new Set(prev);
            if (siguiente.has(id)) siguiente.delete(id);
            else siguiente.add(id);
            return siguiente;
        });
    };

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

            <FiltrosEventos filtro={filtro} />

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
                                const actividades = actividadesDeEvento(evento.id);
                                const tieneActividades = actividades.length > 0;
                                const expandido = tieneActividades && expandidos.has(evento.id);
                                return (
                                    <Fragment key={evento.id}>
                                    <tr className="hover:bg-background/60 transition-colors">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-1.5">
                                                {tieneActividades ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => alternarExpandido(evento.id)}
                                                        aria-expanded={expandido}
                                                        aria-label={`${expandido ? 'Ocultar' : 'Mostrar'} actividades de ${evento.title}`}
                                                        title={`${actividades.length} ${actividades.length === 1 ? 'actividad' : 'actividades'}`}
                                                        className="shrink-0 rounded-md p-0.5 text-foreground-faint transition-colors hover:bg-primary/10 hover:text-primary cursor-pointer"
                                                    >
                                                        {expandido ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                                    </button>
                                                ) : (
                                                    <span className="w-5 shrink-0" aria-hidden="true" />
                                                )}
                                                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ${colors.bg} ${colors.text}`}>
                                                    {evento.title}
                                                </span>
                                            </div>
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
                                                    onClick={() => onAddActividad(evento)}
                                                    aria-label={`Agregar actividad a ${evento.title}`}
                                                    title="Agregar actividad"
                                                    className="rounded-md p-1.5 text-foreground-faint transition-colors hover:bg-primary/10 hover:text-primary cursor-pointer"
                                                >
                                                    <Plus size={16} />
                                                </button>
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
                                    {expandido && (
                                        <tr>
                                            <td colSpan={6} className="p-0">
                                                <TablaActividades
                                                    actividades={actividades}
                                                    embebida
                                                    onEdit={(actividad) => onEditActividad(evento, actividad)}
                                                    onDelete={onDeleteActividad}
                                                />
                                            </td>
                                        </tr>
                                    )}
                                    </Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
