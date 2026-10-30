import { useState } from 'react';
import { endOfMonth, startOfMonth } from 'date-fns';
import { AlertCircle, MousePointerClick, RotateCw } from 'lucide-react';
import CabeceraMes from './CabeceraMes';
import EncabezadoSeccion from '../EncabezadoSeccion';
import GrillaMes, { GrillaMesCargando } from './GrillaMes';
import ModalAgendaDia from './ModalAgendaDia';
import ListaEventosMes from './ListaEventosMes';
import { useEventosPublicos } from '../../hooks/useEventosPublicos';
import { ocurreEnDia } from '../../../Calendario/lib/eventosPorDia';

const ocurreEnMes = (evento, mes) => evento.start <= endOfMonth(mes) && evento.end >= startOfMonth(mes);

function ErrorCarga({ mensaje, onReintentar }) {
    return (
        <div role="alert" className="flex flex-col items-center justify-center gap-4 px-6 py-20 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-danger-soft">
                <AlertCircle className="h-6 w-6 text-danger" aria-hidden="true" />
            </div>
            <p className="max-w-sm text-sm text-foreground-soft">{mensaje}</p>
            <button
                type="button"
                onClick={onReintentar}
                className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-on-primary shadow-sm transition-colors hover:bg-primary-hover"
            >
                <RotateCw size={16} aria-hidden="true" />
                Reintentar
            </button>
        </div>
    );
}

/**
 * Calendario público de la landing: refleja los eventos activos del calendario
 * del dashboard y permite consultar, sin editar, las actividades de cada día.
 */
export default function CalendarioEventos() {
    const { eventos, cargando, error, recargar } = useEventosPublicos();
    const [mes, setMes] = useState(() => new Date());
    const [diaSeleccionado, setDiaSeleccionado] = useState(null);

    const eventosDelMes = eventos
        .filter((evento) => ocurreEnMes(evento, mes))
        .sort((a, b) => a.start - b.start);
    const sinDatos = error && eventos.length === 0;

    let cuerpo;
    if (cargando) cuerpo = <GrillaMesCargando mes={mes} />;
    else if (sinDatos) cuerpo = <ErrorCarga mensaje={error} onReintentar={recargar} />;
    else {
        cuerpo = (
            <>
                <GrillaMes mes={mes} eventos={eventos} onSeleccionarDia={setDiaSeleccionado} />
                {eventosDelMes.length > 0 && (
                    <ListaEventosMes mes={mes} eventos={eventosDelMes} onSeleccionarDia={setDiaSeleccionado} />
                )}
            </>
        );
    }

    return (
        <section id="calendario" aria-labelledby="titulo-calendario" className="scroll-mt-24 bg-background py-16 sm:py-20">
            <div className="container mx-auto px-4">
                <EncabezadoSeccion
                    id="titulo-calendario"
                    etiqueta="Agenda institucional"
                    titulo="Calendario de eventos"
                    descripcion="Consulta los eventos del CTP de Corralillo y descubre las actividades programadas para cada día."
                />

                <div className="mx-auto max-w-6xl rounded-2xl border border-border bg-surface shadow-sm">
                    <CabeceraMes mes={mes} cantidadEventos={eventosDelMes.length} onCambiarMes={setMes} />
                    <div className="overflow-hidden">{cuerpo}</div>
                    <div className="flex flex-col items-center justify-between gap-2 rounded-b-2xl border-t border-border px-4 py-3 text-xs text-foreground-soft sm:flex-row sm:px-6 sm:text-sm">
                        <span className="inline-flex items-center gap-2">
                            <MousePointerClick size={16} className="text-primary" aria-hidden="true" />
                            Selecciona un día para ver sus actividades
                        </span>
                        {!cargando && !sinDatos && eventosDelMes.length === 0 && (
                            <span>No hay eventos programados este mes.</span>
                        )}
                    </div>
                </div>
            </div>

            {diaSeleccionado && (
                <ModalAgendaDia
                    dia={diaSeleccionado}
                    eventos={eventos.filter((evento) => ocurreEnDia(evento, diaSeleccionado))}
                    onClose={() => setDiaSeleccionado(null)}
                />
            )}
        </section>
    );
}
