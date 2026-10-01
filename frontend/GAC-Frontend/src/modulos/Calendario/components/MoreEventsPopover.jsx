import { useEffect, useRef, useState } from 'react';
import { format, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import EventChip from './EventChip';

export default function MoreEventsPopover({ date, events, onEventClick }) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        if (!open) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setOpen(false);
        };
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [open]);

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="w-full truncate rounded-md px-1.5 py-0.5 text-left text-[11px] font-semibold text-foreground-faint hover:text-primary hover:bg-primary/10 transition-colors"
            >
                +{events.length} más
            </button>
            {open && (
                <div className="absolute left-0 top-full z-20 mt-1 w-56 rounded-xl border border-border bg-surface p-2 shadow-lg">
                    <p className="px-1 pb-1.5 text-xs font-semibold text-foreground-soft capitalize">
                        {format(date, "EEEE d 'de' MMMM", { locale: es })}
                    </p>
                    <div className="flex flex-col gap-1">
                        {events.map((event) => (
                            <EventChip
                                key={event.id}
                                event={event}
                                variant="pill"
                                onClick={onEventClick}
                                continuation={!isSameDay(event.start, date)}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
