import { isSameDay, format, setHours } from 'date-fns';
import EventChip from './EventChip';
import { HOURS, topOffsetPx, heightPx } from '../lib/timeGrid';

export default function DayView({ currentDate, events, onEventClick }) {
    const dayEvents = events.filter((event) => isSameDay(event.start, currentDate));
    const allDayEvents = dayEvents.filter((event) => event.allDay);
    const timedEvents = dayEvents.filter((event) => !event.allDay);

    return (
        <div className="flex flex-col">
            <div className="overflow-x-auto">
                <div className="min-w-[420px]">
                    <div className="flex flex-col gap-1 border-b border-border p-2">
                        <span className="text-[10px] font-medium text-foreground-faint">Todo el día</span>
                        {allDayEvents.length === 0 ? (
                            <span className="text-xs text-foreground-faint">Sin eventos de todo el día</span>
                        ) : (
                            allDayEvents.map((event) => <EventChip key={event.id} event={event} variant="pill" onClick={onEventClick} />)
                        )}
                    </div>

                    <div className="max-h-[65vh] overflow-y-auto">
                        <div className="relative grid grid-cols-[70px_1fr]">
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
                            <div className="relative border-l border-border">
                                {HOURS.map((hour) => (
                                    <div key={hour} className="h-16 border-t border-border" />
                                ))}
                                {timedEvents.map((event) => (
                                    <EventChip
                                        key={event.id}
                                        event={event}
                                        variant="block"
                                        onClick={onEventClick}
                                        style={{ top: `${topOffsetPx(event)}px`, height: `${heightPx(event)}px` }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
