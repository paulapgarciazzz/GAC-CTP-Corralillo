import { startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday, format, setHours } from 'date-fns';
import { es } from 'date-fns/locale';
import EventChip from './EventChip';
import { HOURS, topOffsetPx, heightPx } from '../lib/timeGrid';

export default function WeekView({ currentDate, events }) {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    const eventsForDay = (day) => events.filter((event) => isSameDay(event.start, day));

    return (
        <div className="flex flex-col">
            <div className="overflow-x-auto">
                <div className="min-w-[720px]">
                    <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border bg-background sticky top-0 z-10">
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

                    <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border">
                        <div className="border-r border-border p-1 text-[10px] font-medium text-foreground-faint">
                            Todo el día
                        </div>
                        {days.map((day) => {
                            const allDayEvents = eventsForDay(day).filter((event) => event.allDay);
                            return (
                                <div key={day.toISOString()} className="flex flex-col gap-1 border-l border-border p-1">
                                    {allDayEvents.map((event) => (
                                        <EventChip key={event.id} event={event} variant="pill" />
                                    ))}
                                </div>
                            );
                        })}
                    </div>

                    <div className="max-h-[60vh] overflow-y-auto">
                        <div className="relative grid grid-cols-[60px_repeat(7,1fr)]">
                            <div>
                                {HOURS.map((hour) => (
                                    <div
                                        key={hour}
                                        className="h-16 -translate-y-2 border-t border-border pr-2 text-right text-xs text-foreground-faint"
                                    >
                                        {format(setHours(currentDate, hour), 'HH:00')}
                                    </div>
                                ))}
                            </div>
                            {days.map((day) => {
                                const timedEvents = eventsForDay(day).filter((event) => !event.allDay);
                                return (
                                    <div key={day.toISOString()} className="relative border-l border-border">
                                        {HOURS.map((hour) => (
                                            <div key={hour} className="h-16 border-t border-border" />
                                        ))}
                                        {timedEvents.map((event) => (
                                            <EventChip
                                                key={event.id}
                                                event={event}
                                                variant="block"
                                                style={{ top: `${topOffsetPx(event)}px`, height: `${heightPx(event)}px` }}
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
    );
}
