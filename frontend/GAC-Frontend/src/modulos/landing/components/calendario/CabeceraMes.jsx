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
            className={`cursor-pointer rounded-lg p-2 transition-colors hover:bg-white/20 ${className}`}
        >
            <Icono size={22} />
        </button>
    );
}

export default function CabeceraMes({ mes, cantidadEventos, onCambiarMes }) {
    const resumen = cantidadEventos === 1 ? '1 evento este mes' : `${cantidadEventos} eventos este mes`;

    return (
        <div className="relative rounded-t-3xl bg-linear-to-r from-primary to-accent px-4 py-5 text-white sm:px-6 sm:py-6 dark:from-primary/35 dark:to-accent/25">
            {/* Decoración aparte: su overflow-hidden no debe recortar el selector de año. */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-t-3xl" aria-hidden="true">
                <div className="absolute -right-10 -top-16 h-44 w-44 rounded-full bg-white/10" />
                <div className="absolute -bottom-20 right-32 h-36 w-36 rounded-full bg-white/5" />
            </div>

            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center justify-between gap-3">
                    <BotonMes direccion="anterior" mes={mes} onCambiarMes={onCambiarMes} className="sm:hidden" />
                    <div className="text-center sm:text-left">
                        <h3 className="text-2xl font-bold capitalize leading-tight sm:text-3xl">
                            {format(mes, 'MMMM yyyy', { locale: es })}
                        </h3>
                        <p className="mt-0.5 text-xs font-medium text-white/80 sm:text-sm">{resumen}</p>
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
                        className="cursor-pointer rounded-lg bg-white/15 px-4 py-1.5 text-sm font-semibold transition-colors hover:bg-white/25"
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
