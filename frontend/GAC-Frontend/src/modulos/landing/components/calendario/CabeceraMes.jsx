import { addMonths, format, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MonthYearSelect from '../../../Calendario/components/MonthYearSelect';

function BotonMes({ direccion, mes, onCambiarMes, className = '' }) {
    const anterior = direccion === 'anterior';
    const Icono = anterior ? ChevronLeft : ChevronRight;

    return (
        <button
            type="button"
            onClick={() => onCambiarMes(anterior ? subMonths(mes, 1) : addMonths(mes, 1))}
            aria-label={anterior ? 'Mes anterior' : 'Mes siguiente'}
            className={`inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg transition-colors hover:bg-white/15 ${className}`}
        >
            <Icono size={22} aria-hidden="true" />
        </button>
    );
}

export default function CabeceraMes({ mes, cantidadEventos, onCambiarMes }) {
    const resumen = cantidadEventos === 1 ? '1 evento este mes' : `${cantidadEventos} eventos este mes`;

    return (
        <div className="relative rounded-t-2xl bg-rail px-4 py-5 text-white sm:px-6 sm:py-6">
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center justify-between gap-3">
                    <BotonMes direccion="anterior" mes={mes} onCambiarMes={onCambiarMes} className="sm:hidden" />
                    <div className="text-center sm:text-left">
                        <h3 aria-live="polite" className="text-2xl font-semibold capitalize leading-tight sm:text-3xl">
                            {format(mes, 'MMMM yyyy', { locale: es })}
                        </h3>
                        <p className="mt-1 text-xs font-medium text-white/75 sm:text-sm">{resumen}</p>
                    </div>
                    <BotonMes direccion="siguiente" mes={mes} onCambiarMes={onCambiarMes} className="sm:hidden" />
                </div>

                <div className="flex items-center justify-center gap-2">
                    <div className="hidden md:block">
                        <MonthYearSelect currentDate={mes} onChange={onCambiarMes} />
                    </div>
                    <button
                        type="button"
                        onClick={() => onCambiarMes(new Date())}
                        className="inline-flex min-h-10 cursor-pointer items-center rounded-lg border border-white/25 px-4 py-1.5 text-sm font-semibold transition-colors hover:bg-white/15"
                    >
                        Hoy
                    </button>
                    <div className="hidden items-center sm:flex">
                        <BotonMes direccion="anterior" mes={mes} onCambiarMes={onCambiarMes} />
                        <BotonMes direccion="siguiente" mes={mes} onCambiarMes={onCambiarMes} />
                    </div>
                </div>
            </div>
        </div>
    );
}
