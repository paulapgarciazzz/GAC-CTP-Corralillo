import { ChevronLeft, ChevronRight } from 'lucide-react';
import { addMonths, addYears, format } from 'date-fns';
import { es } from 'date-fns/locale';

function Stepper({ label, onPrev, onNext, prevAriaLabel, nextAriaLabel }) {
    return (
        <div className="flex items-center rounded-lg border border-border bg-surface overflow-hidden">
            <button
                type="button"
                onClick={onPrev}
                aria-label={prevAriaLabel}
                className="p-1.5 text-foreground-soft transition-colors hover:bg-primary/10 hover:text-primary"
            >
                <ChevronLeft size={14} />
            </button>
            <span className="min-w-[4.5rem] select-none px-1 text-center text-sm font-medium capitalize text-foreground-soft">
                {label}
            </span>
            <button
                type="button"
                onClick={onNext}
                aria-label={nextAriaLabel}
                className="p-1.5 text-foreground-soft transition-colors hover:bg-primary/10 hover:text-primary"
            >
                <ChevronRight size={14} />
            </button>
        </div>
    );
}

export default function MonthYearSelect({ currentDate, onChange }) {
    return (
        <div className="flex items-center gap-1.5">
            <Stepper
                label={format(currentDate, 'MMMM', { locale: es })}
                onPrev={() => onChange(addMonths(currentDate, -1))}
                onNext={() => onChange(addMonths(currentDate, 1))}
                prevAriaLabel="Mes anterior"
                nextAriaLabel="Mes siguiente"
            />
            <Stepper
                label={format(currentDate, 'yyyy')}
                onPrev={() => onChange(addYears(currentDate, -1))}
                onNext={() => onChange(addYears(currentDate, 1))}
                prevAriaLabel="Año anterior"
                nextAriaLabel="Año siguiente"
            />
        </div>
    );
}
