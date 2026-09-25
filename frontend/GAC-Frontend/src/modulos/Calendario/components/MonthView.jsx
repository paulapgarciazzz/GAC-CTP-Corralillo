import {
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isToday,
    format,
} from 'date-fns';
import EventChip from './EventChip';
import MoreEventsPopover from './MoreEventsPopover';

const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MAX_VISIBLE_EVENTS = 3;

export default function MonthView({ currentDate, events, onDayClick, onEventClick }) {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

    const eventsForDay = (day) => events.filter((event) => isSameDay(event.start, day));

    return (
        <div>
            <div className="grid grid-cols-7 border-b border-border bg-background">
                {WEEKDAY_LABELS.map((label) => (
                    <div
                        key={label}
                        className="py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-foreground-faint"
                    >
                        {label}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7 divide-x divide-y divide-border">
                {days.map((day) => {
                    const dayEvents = eventsForDay(day);
                    const inMonth = isSameMonth(day, currentDate);
                    const visibleEvents = dayEvents.slice(0, MAX_VISIBLE_EVENTS);
                    const overflowEvents = dayEvents.slice(MAX_VISIBLE_EVENTS);

                    return (
                        <div
                            key={day.toISOString()}
                            className={`flex min-h-[56px] flex-col gap-1 p-1.5 sm:min-h-[80px] sm:p-2 ${
                                inMonth ? 'bg-surface' : 'bg-background/60'
                            }`}
                        >
                            <button
                                type="button"
                                onClick={() => onDayClick?.(day)}
                                className={`inline-flex h-7 w-7 shrink-0 items-center justify-center self-end rounded-full text-sm transition-colors ${
                                    isToday(day)
                                        ? 'bg-primary font-semibold text-white'
                                        : inMonth
                                          ? 'text-foreground hover:bg-primary/10 hover:text-primary'
                                          : 'text-foreground-faint hover:bg-primary/10'
                                }`}
                            >
                                {format(day, 'd')}
                            </button>
                            {dayEvents.length > 0 && (
                                <div className="flex flex-wrap items-center gap-1 sm:hidden">
                                    {dayEvents.slice(0, 4).map((event) => (
                                        <EventChip key={event.id} event={event} variant="dot" />
                                    ))}
                                    {dayEvents.length > 4 && (
                                        <span className="text-[9px] font-semibold text-foreground-faint">
                                            +{dayEvents.length - 4}
                                        </span>
                                    )}
                                </div>
                            )}
                            <div className="hidden flex-1 flex-col gap-1 overflow-hidden sm:flex">
                                {visibleEvents.map((event) => (
                                    <EventChip key={event.id} event={event} variant="pill" onClick={onEventClick} />
                                ))}
                                {overflowEvents.length > 0 && (
                                    <MoreEventsPopover date={day} events={overflowEvents} onEventClick={onEventClick} />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
