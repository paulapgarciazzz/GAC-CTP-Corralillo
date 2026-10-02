import { Eye } from 'lucide-react';
import { CATEGORY_COLORS } from '../../../Calendario/lib/categorias';
import { formatearRangoEvento, formatearHorarioEvento } from '../../../Calendario/lib/fechas';
import FiltrosEventos from '../../../Calendario/components/FiltrosEventos';

/**
 * Lista filtrable de eventos. `filtro` es el objeto de useFiltroEventos.
 */
export default function ListaEventosReporte({ filtro, onVer }) {
    const { eventosFiltrados } = filtro;

    return (
        <div className="space-y-4">
            <FiltrosEventos filtro={filtro} idPrefijo="reporte-actividades" />

            {eventosFiltrados.length === 0 ? (
                <div className="flex items-center justify-center py-12 border border-border rounded-xl bg-surface">
                    <p className="text-sm text-foreground-faint text-center">No se encontraron eventos con esos criterios.</p>
                </div>
            ) : (
                <div className="bg-surface border border-border rounded-xl overflow-x-auto">
                    <table className="w-full min-w-[640px] text-sm">
                        <thead className="bg-background border-b border-border">
                            <tr className="text-left text-xs uppercase tracking-wider text-foreground-faint">
                                <th className="px-4 py-3 font-semibold">Evento</th>
                                <th className="px-4 py-3 font-semibold">Fechas</th>
                                <th className="px-4 py-3 font-semibold">Horario</th>
                                <th className="px-4 py-3 font-semibold text-right">Reporte</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {eventosFiltrados.map((evento) => {
                                const colors = CATEGORY_COLORS[evento.category] || CATEGORY_COLORS.info;
                                return (
                                    <tr key={evento.id} className="hover:bg-background/60 transition-colors">
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ${colors.bg} ${colors.text}`}>
                                                {evento.title}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-foreground-soft whitespace-nowrap">{formatearRangoEvento(evento)}</td>
                                        <td className="px-4 py-3 text-foreground-faint whitespace-nowrap">{formatearHorarioEvento(evento)}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() => onVer(evento)}
                                                    aria-label={`Ver reporte de ${evento.title}`}
                                                    className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/10 cursor-pointer"
                                                >
                                                    <Eye size={15} />
                                                    Ver
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
