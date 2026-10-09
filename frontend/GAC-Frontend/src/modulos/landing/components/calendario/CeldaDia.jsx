import { format, isSameDay, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { CATEGORY_COLORS } from '../../../Calendario/lib/categorias';

// En celular caben menos barras por celda; el resto se resume en "+N".
const VISIBLES_MOVIL = 2;
const VISIBLES_ESCRITORIO = 3;

function BarraEvento({ evento, dia, soloEscritorio }) {
    const colores = CATEGORY_COLORS[evento.category] || CATEGORY_COLORS.info;
    const mostrarHora = !evento.allDay && isSameDay(evento.start, dia);

    return (
        <span
            className={`${soloEscritorio ? 'hidden sm:block' : 'block'} rounded-md border-l-2 border-current px-1 py-0.5 text-[10px] font-medium leading-tight sm:border-l-[3px] sm:px-1.5 sm:text-xs ${colores.bg} ${colores.text}`}
        >
            <span lang="es" className="line-clamp-3 hyphens-auto wrap-break-word sm:line-clamp-2">
                {mostrarHora && (
                    <span className="mr-1 hidden font-semibold opacity-75 sm:inline">{format(evento.start, 'HH:mm')}</span>
                )}
                {evento.title}
            </span>
        </span>
    );
}

export default function CeldaDia({ dia, eventos, enMes, onSeleccionar }) {
    const hoy = isToday(dia);
    const tieneEventos = eventos.length > 0;
    const cantidad = eventos.length === 1 ? '1 evento' : `${eventos.length} eventos`;

    return (
        <button
            type="button"
            onClick={() => onSeleccionar(dia)}
            aria-label={`${format(dia, "EEEE d 'de' MMMM", { locale: es })}: ${tieneEventos ? cantidad : 'sin eventos'}`}
            className={`group flex min-h-[92px] min-w-0 cursor-pointer flex-col gap-1 p-1 text-left transition-colors focus-visible:relative focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-primary sm:min-h-[120px] sm:p-2 ${
                enMes ? 'bg-surface hover:bg-background' : 'bg-background'
            } ${tieneEventos && enMes ? 'bg-linear-to-b from-primary/5 to-transparent' : ''}`}
        >
            <span
                className={`inline-flex h-6 w-6 shrink-0 items-center justify-center self-end rounded-full text-xs transition-colors sm:h-7 sm:w-7 sm:text-sm ${
                    hoy
                        ? 'bg-primary font-bold text-white shadow-sm'
                        : enMes
                          ? 'font-medium text-foreground group-hover:bg-primary/10 group-hover:text-primary'
                          : 'text-foreground-faint'
                }`}
            >
                {format(dia, 'd')}
            </span>

            <span className={`flex min-w-0 flex-col gap-1 ${enMes ? '' : 'opacity-60'}`}>
                {eventos.slice(0, VISIBLES_ESCRITORIO).map((evento, i) => (
                    <BarraEvento key={evento.id} evento={evento} dia={dia} soloEscritorio={i >= VISIBLES_MOVIL} />
                ))}
                {eventos.length > VISIBLES_MOVIL && (
                    <span className="px-1 text-[10px] font-semibold text-foreground-faint sm:hidden">
                        +{eventos.length - VISIBLES_MOVIL}
                    </span>
                )}
                {eventos.length > VISIBLES_ESCRITORIO && (
                    <span className="hidden px-1.5 text-xs font-semibold text-foreground-faint sm:block">
                        +{eventos.length - VISIBLES_ESCRITORIO} más
                    </span>
                )}
            </span>
        </button>
    );
}
