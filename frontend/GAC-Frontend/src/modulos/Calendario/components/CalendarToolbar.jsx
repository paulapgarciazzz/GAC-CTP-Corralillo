import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import MonthYearSelect from './MonthYearSelect';

const VIEW_OPTIONS = [
    { key: 'month', label: 'Mes' },
    { key: 'week', label: 'Semana' },
    { key: 'day', label: 'Día' },
];

function getLabel(currentDate, viewMode) {
    if (viewMode === 'month') {
        return format(currentDate, 'MMMM yyyy', { locale: es });
    }
    if (viewMode === 'week') {
        const start = startOfWeek(currentDate, { weekStartsOn: 1 });
        const end = endOfWeek(currentDate, { weekStartsOn: 1 });
        return `${format(start, 'd MMM', { locale: es })} – ${format(end, 'd MMM yyyy', { locale: es })}`;
    }
    return format(currentDate, "EEEE d 'de' MMMM yyyy", { locale: es });
}

export default function CalendarToolbar({ currentDate, viewMode, onViewModeChange, onToday, onPrev, onNext, onDateChange }) {
    const label = getLabel(currentDate, viewMode);

    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
                <MonthYearSelect currentDate={currentDate} onChange={onDateChange} />
                <button
                    type="button"
                    onClick={onToday}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground-soft transition-colors hover:bg-primary/10 hover:text-primary"
                >
                    Hoy
                </button>
                
                <h2 className="ml-1 text-lg font-semibold capitalize text-foreground sm:text-xl">{label}</h2>
            </div>
            <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
                <button className="rounded-lg bg-primary px-6 py-2 font-medium text-white shadow-md transition duration-300 hover:bg-primary-hover hover:shadow-lg"
                    type="button"
                    
                >
                    + Crear evento
                </button>
                <div className="inline-flex rounded-xl border border-border bg-background p-1">
                    {VIEW_OPTIONS.map((opt) => (
                        <button
                            key={opt.key}
                            type="button"
                            onClick={() => onViewModeChange(opt.key)}
                            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                                viewMode === opt.key
                                    ? 'bg-primary text-white shadow-sm'
                                    : 'text-foreground-soft hover:bg-primary/10 hover:text-primary'
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
