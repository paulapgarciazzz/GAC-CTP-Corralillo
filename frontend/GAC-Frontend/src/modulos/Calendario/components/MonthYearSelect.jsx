import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { setMonth, setYear, format } from 'date-fns';
import { es } from 'date-fns/locale';

const MESES = Array.from({ length: 12 }, (_, i) => format(new Date(2000, i, 1), 'MMMM', { locale: es }));
const ANIOS_POR_PAGINA = 12;

function inicioBloque(anio) {
    return anio - (((anio % ANIOS_POR_PAGINA) + ANIOS_POR_PAGINA) % ANIOS_POR_PAGINA);
}

function Dropdown({ value, onChange, options, ariaLabel }) {
    return (
        <div className="relative flex items-center rounded-lg border border-border bg-surface overflow-hidden">
            <select
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                aria-label={ariaLabel}
                className="min-w-[4.5rem] cursor-pointer appearance-none bg-transparent py-1.5 pl-2.5 pr-7 text-sm font-medium capitalize text-foreground-soft outline-none transition-colors hover:bg-primary/10 hover:text-primary"
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-surface capitalize text-foreground">
                        {opt.label}
                    </option>
                ))}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-2 text-foreground-soft" />
        </div>
    );
}

function YearPicker({ value, onChange }) {
    const [abierto, setAbierto] = useState(false);
    const [desde, setDesde] = useState(() => inicioBloque(value));
    const ref = useRef(null);
    const anioHoy = new Date().getFullYear();

    useEffect(() => {
        if (!abierto) return;
        const handleClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setAbierto(false);
        };
        const handleKey = (e) => {
            if (e.key === 'Escape') setAbierto(false);
        };
        document.addEventListener('mousedown', handleClick);
        document.addEventListener('keydown', handleKey);
        return () => {
            document.removeEventListener('mousedown', handleClick);
            document.removeEventListener('keydown', handleKey);
        };
    }, [abierto]);

    const toggle = () => {
        if (!abierto) setDesde(inicioBloque(value));
        setAbierto((v) => !v);
    };

    const anios = Array.from({ length: ANIOS_POR_PAGINA }, (_, i) => desde + i);

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={toggle}
                aria-label="Seleccionar año"
                aria-expanded={abierto}
                className="flex min-w-[4.5rem] items-center justify-between gap-1 rounded-lg border border-border bg-surface py-1.5 pl-2.5 pr-2 text-sm font-medium text-foreground-soft transition-colors hover:bg-primary/10 hover:text-primary"
            >
                {value}
                <ChevronDown size={14} className={`transition-transform ${abierto ? 'rotate-180' : ''}`} />
            </button>

            {abierto && (
                <div className="absolute left-0 top-full z-50 mt-1 w-56 rounded-xl border border-border bg-surface p-2 shadow-lg">
                    <div className="mb-2 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => setDesde((d) => d - ANIOS_POR_PAGINA)}
                            aria-label="Años anteriores"
                            className="rounded-md p-1 text-foreground-soft transition-colors hover:bg-primary/10 hover:text-primary"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="text-sm font-semibold text-foreground">
                            {desde} – {desde + ANIOS_POR_PAGINA - 1}
                        </span>
                        <button
                            type="button"
                            onClick={() => setDesde((d) => d + ANIOS_POR_PAGINA)}
                            aria-label="Años siguientes"
                            className="rounded-md p-1 text-foreground-soft transition-colors hover:bg-primary/10 hover:text-primary"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                        {anios.map((anio) => (
                            <button
                                key={anio}
                                type="button"
                                onClick={() => {
                                    onChange(anio);
                                    setAbierto(false);
                                }}
                                className={`rounded-lg py-1.5 text-sm font-medium transition-colors ${
                                    anio === value
                                        ? 'bg-primary text-white shadow-sm'
                                        : anio === anioHoy
                                            ? 'border border-primary/40 text-primary hover:bg-primary/10'
                                            : 'text-foreground-soft hover:bg-primary/10 hover:text-primary'
                                }`}
                            >
                                {anio}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function MonthYearSelect({ currentDate, onChange }) {
    return (
        <div className="flex items-center gap-1.5">
            <Dropdown
                value={currentDate.getMonth()}
                onChange={(mes) => onChange(setMonth(currentDate, mes))}
                options={MESES.map((label, i) => ({ value: i, label }))}
                ariaLabel="Seleccionar mes"
            />
            <YearPicker
                value={currentDate.getFullYear()}
                onChange={(anio) => onChange(setYear(currentDate, anio))}
            />
        </div>
    );
}
