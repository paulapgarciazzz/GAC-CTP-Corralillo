import { format, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarRange, CalendarX2, Clock } from 'lucide-react';
import ModalBase from '../../../Calendario/components/ModalBase';
import { CATEGORY_COLORS } from '../../../Calendario/lib/categorias';
import { formatearHorarioEvento, formatearRangoEvento } from '../../../Calendario/lib/fechas';
import { useActividadesDelDia } from '../../hooks/useActividadesDelDia';

const capitalizar = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1);

function ActividadesCargando() {
    return (
        <div className="animate-pulse space-y-3" aria-hidden="true">
            <div className="h-3 w-24 rounded bg-border" />
            <div className="h-4 w-3/4 rounded bg-border" />
        </div>
    );
}

function LineaDeTiempo({ actividades }) {
    return (
        <ol className="ml-1.5 space-y-3 border-l-2 border-border pl-4">
            {actividades.map((actividad) => (
                <li key={actividad.id_actividad} className="relative">
                    <span className="absolute -left-[23px] top-1 h-3 w-3 rounded-full border-2 border-surface bg-primary" />
                    <p className="text-xs font-semibold text-primary">
                        {actividad.hora_inicio} – {actividad.hora_finalizacion}
                    </p>
                    <p className="text-sm text-foreground wrap-break-word">{actividad.titulo}</p>
                </li>
            ))}
        </ol>
    );
}

function TarjetaEvento({ evento, dia, actividades, cargando }) {
    const colores = CATEGORY_COLORS[evento.category] || CATEGORY_COLORS.info;
    const variosDias = !isSameDay(evento.start, evento.end);

    let contenido;
    if (cargando) contenido = <ActividadesCargando />;
    else if (!actividades) contenido = <p className="text-sm text-danger">No se pudieron cargar las actividades.</p>;
    else if (actividades.length === 0) contenido = <p className="text-sm text-foreground-faint">Sin actividades programadas para este día.</p>;
    else contenido = <LineaDeTiempo actividades={actividades} />;

    return (
        <li className="overflow-hidden rounded-2xl border border-border bg-background">
            <div className={`border-l-4 border-current px-4 py-3.5 ${colores.bg} ${colores.text}`}>
                <h3 className="text-base font-bold text-foreground wrap-break-word">{evento.title}</h3>
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-foreground-soft sm:text-sm">
                    <span className="inline-flex items-center gap-1.5">
                        <Clock size={14} className={colores.text} />
                        {formatearHorarioEvento(evento)}
                    </span>
                    {variosDias && (
                        <span className="inline-flex items-center gap-1.5">
                            <CalendarRange size={14} className={colores.text} />
                            {formatearRangoEvento(evento)}
                        </span>
                    )}
                </div>
            </div>
            <div className="px-4 py-3.5">
                <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-foreground-faint">
                    Actividades del {format(dia, "d 'de' MMMM", { locale: es })}
                </p>
                {contenido}
            </div>
        </li>
    );
}

/**
 * Agenda de solo lectura de un día del calendario público: sus eventos y las
 * actividades programadas en esa fecha (título y horario).
 */
export default function ModalAgendaDia({ dia, eventos, onClose }) {
    const { cargando, actividadesDe } = useActividadesDelDia(dia, eventos);
    const cantidad = eventos.length === 1 ? '1 evento' : `${eventos.length} eventos`;

    return (
        <ModalBase
            titulo={capitalizar(format(dia, "EEEE d 'de' MMMM", { locale: es }))}
            subtitulo={`${format(dia, 'yyyy')} · ${eventos.length ? cantidad : 'Sin eventos'}`}
            alineacion="left"
            anchoMaximo="max-w-2xl"
            onClose={onClose}
        >
            {eventos.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-background py-12 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                        <CalendarX2 className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm text-foreground-soft">No hay eventos programados para este día.</p>
                </div>
            ) : (
                <ul className="space-y-4">
                    {eventos.map((evento) => (
                        <TarjetaEvento
                            key={evento.id}
                            evento={evento}
                            dia={dia}
                            actividades={actividadesDe(evento.id)}
                            cargando={cargando}
                        />
                    ))}
                </ul>
            )}
        </ModalBase>
    );
}
