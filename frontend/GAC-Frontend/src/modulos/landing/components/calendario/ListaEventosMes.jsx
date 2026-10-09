import { format, isSameDay, max, startOfDay, startOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronRight } from 'lucide-react';
import { CATEGORY_COLORS } from '../../../Calendario/lib/categorias';
import { formatearHorarioEvento, formatearRangoEvento } from '../../../Calendario/lib/fechas';

/**
 * Resumen del mes para pantallas pequeñas, donde las celdas de la grilla son
 * demasiado angostas para leer los nombres completos de los eventos.
 */
export default function ListaEventosMes({ mes, eventos, onSeleccionarDia }) {
    return (
        <div className="border-t border-border px-4 py-4 sm:hidden">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-foreground-faint">
                Eventos de {format(mes, 'MMMM', { locale: es })}
            </p>
            <ul className="space-y-2">
                {eventos.map((evento) => {
                    const colores = CATEGORY_COLORS[evento.category] || CATEGORY_COLORS.info;
                    // Un evento que empezó el mes anterior se ubica en el primer día del mes visible.
                    const dia = startOfDay(max([evento.start, startOfMonth(mes)]));

                    return (
                        <li key={evento.id}>
                            <button
                                type="button"
                                onClick={() => onSeleccionarDia(dia)}
                                className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-border bg-background p-2.5 text-left transition-colors hover:border-primary/40"
                            >
                                <span className={`flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg ${colores.bg} ${colores.text}`}>
                                    <span className="text-[10px] font-semibold uppercase leading-none">
                                        {format(dia, 'EEE', { locale: es }).replace('.', '')}
                                    </span>
                                    <span className="text-lg font-bold leading-tight">{format(dia, 'd')}</span>
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block text-sm font-semibold text-foreground wrap-break-word">{evento.title}</span>
                                    <span className="block text-xs text-foreground-soft">
                                        {isSameDay(evento.start, evento.end) ? formatearHorarioEvento(evento) : formatearRangoEvento(evento)}
                                    </span>
                                </span>
                                <ChevronRight size={16} className="shrink-0 text-foreground-faint" />
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
