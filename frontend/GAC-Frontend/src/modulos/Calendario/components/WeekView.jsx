import { startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday, format, setHours } from 'date-fns';
import { es } from 'date-fns/locale';
import EventChip from './EventChip';
import { HOURS, topOffsetPx, heightPx } from '../lib/timeGrid';
import { ocurreEnDia, segmentoDelDia } from '../lib/eventosPorDia';

export default function WeekView({ currentDate, events, onEventClick }) {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    const eventsForDay = (day) => events.filter((event) => ocurreEnDia(event, day));

    return (
        <div className="flex flex-col">
            <div className="overflow-x-auto">
                <div className="min-w-[720px]">
                    <div className="max-h-[60vh] overflow-y-auto">
                    <div className="grid grid-cols-[60px_repeat(7,minmax(0,1fr))] border-b border-border bg-background sticky top-0 z-10">
                        <div />
                        {days.map((day) => (
                            <div key={day.toISOString()} className="border-l border-border py-2 text-center">
                                <div className="text-[11px] font-semibold uppercase tracking-wide text-foreground-faint">
                                    {format(day, 'EEE', { locale: es })}
                                </div>
                                <div
                                    className={`mx-auto mt-1 flex h-7 w-7 items-center justify-center rounded-full text-sm ${
                                        isToday(day) ? 'bg-primary font-semibold text-white' : 'text-foreground'
                                    }`}
                                >
                                    {format(day, 'd')}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-[60px_repeat(7,minmax(0,1fr))] border-b border-border">
                        <div className="flex items-start border-r border-border p-1 text-[10px] font-medium text-foreground-faint">
                            Todo el día
                        </div>
                        {days.map((day) => {
                            const allDayEvents = eventsForDay(day).filter((event) => event.allDay);
                            return (
                                <div key={day.toISOString()} className="flex min-h-0 min-w-0 flex-col items-stretch gap-1 border-l border-border p-1">
                                    {allDayEvents.map((event) => (
                                        <EventChip key={event.id} event={event} variant="pill" onClick={onEventClick} continuation={!isSameDay(event.start, day)} />
                                    ))}
                                </div>
                            );
                        })}
                    </div>

                    <div>
                        <div className="relative grid grid-cols-[60px_repeat(7,minmax(0,1fr))]">
                            <div>
                                {HOURS.map((hour) => (
                                    <div
                                        key={hour}
                                        className="h-16 border-t border-border pr-2 text-right text-xs text-foreground-faint"
                                    >
                                        {format(setHours(currentDate, hour), 'HH:00')}
                                    </div>
                                ))}
                            </div>
                            {days.map((day) => {
                                const timedEvents = eventsForDay(day).filter((event) => !event.allDay);
                                return (
                                    <div key={day.toISOString()} className="relative min-w-0 border-l border-border">
                                        {HOURS.map((hour) => (
                                            <div key={hour} className="h-16 border-t border-border" />
                                        ))}
                                        {timedEvents.map((event) => (
                                            <EventChip
                                                key={event.id}
                                                event={event}
                                                variant="block"
                                                onClick={onEventClick}
                                                style={{ top: `${topOffsetPx(segmentoDelDia(event, day))}px`, height: `${heightPx(segmentoDelDia(event, day))}px` }}
                                            />
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
