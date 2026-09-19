import { format } from 'date-fns';
import { CATEGORY_COLORS } from '../data/sampleEvents';

export default function EventChip({ event, variant = 'pill', style }) {
    const colors = CATEGORY_COLORS[event.category] || CATEGORY_COLORS.info;

    if (variant === 'block') {
        return (
            <div
                style={style}
                className={`absolute left-1 right-1 overflow-hidden rounded-lg border-l-4 border-current/50 px-2 py-1 shadow-sm ${colors.bg} ${colors.text}`}
            >
                <p className="text-xs font-semibold truncate">{event.title}</p>
                {!event.allDay && (
                    <p className="text-[10px] opacity-80">
                        {format(event.start, 'HH:mm')} – {format(event.end, 'HH:mm')}
                    </p>
                )}
            </div>
        );
    }

    return (
        <div className={`flex w-full items-center gap-1 truncate rounded-md px-1.5 py-0.5 text-[11px] font-medium ${colors.bg} ${colors.text}`}>
            {!event.allDay && <span className="shrink-0 opacity-70">{format(event.start, 'HH:mm')}</span>}
            <span className="truncate">{event.title}</span>
        </div>
    );
}
