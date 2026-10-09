import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth } from 'date-fns';
import CeldaDia from './CeldaDia';
import { ocurreEnDia } from '../../../Calendario/lib/eventosPorDia';

const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

// Semanas completas (lunes a domingo) que cubren el mes, igual que la vista mensual del dashboard.
function diasDeLaGrilla(mes) {
    return eachDayOfInterval({
        start: startOfWeek(startOfMonth(mes), { weekStartsOn: 1 }),
        end: endOfWeek(endOfMonth(mes), { weekStartsOn: 1 }),
    });
}

function EncabezadoSemana() {
    return (
        <div className="grid grid-cols-7 border-b border-border bg-background">
            {DIAS_SEMANA.map((dia) => (
                <div
                    key={dia}
                    className="py-2.5 text-center text-[11px] font-semibold uppercase tracking-wide text-foreground-faint"
                >
                    <span className="sm:hidden">{dia[0]}</span>
                    <span className="hidden sm:inline">{dia}</span>
                </div>
            ))}
        </div>
    );
}

export function GrillaMesCargando({ mes }) {
    return (
        <div aria-hidden="true">
            <EncabezadoSemana />
            <div className="grid animate-pulse grid-cols-7 gap-px bg-border">
                {diasDeLaGrilla(mes).map((dia, i) => (
                    <div key={dia.toISOString()} className="flex min-h-[92px] flex-col gap-1.5 bg-surface p-1 sm:min-h-[120px] sm:p-2">
                        <span className="h-5 w-5 self-end rounded-full bg-background sm:h-6 sm:w-6" />
                        {i % 3 === 1 && <span className="h-3 rounded bg-background sm:h-4" />}
                        {i % 5 === 2 && <span className="h-3 w-2/3 rounded bg-background sm:h-4" />}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function GrillaMes({ mes, eventos, onSeleccionarDia }) {
    return (
        <div>
            <EncabezadoSemana />
            <div className="grid grid-cols-7 gap-px bg-border">
                {diasDeLaGrilla(mes).map((dia) => (
                    <CeldaDia
                        key={dia.toISOString()}
                        dia={dia}
                        eventos={eventos.filter((evento) => ocurreEnDia(evento, dia))}
                        enMes={isSameMonth(dia, mes)}
                        onSeleccionar={onSeleccionarDia}
                    />
                ))}
            </div>
        </div>
    );
}
