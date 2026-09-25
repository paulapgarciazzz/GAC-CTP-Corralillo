import { format } from 'date-fns';
import { CATEGORY_COLORS } from '../lib/categorias';

export default function EventChip({ event, variant = 'pill', style, onClick }) {
    const colors = CATEGORY_COLORS[event.category] || CATEGORY_COLORS.info;
    const clickable = onClick
        ? {
              role: 'button',
              tabIndex: 0,
              onClick: () => onClick(event),
              onKeyDown: (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onClick(event);
                  }
              },
          }
        : {};
    const cursor = onClick ? 'cursor-pointer' : '';

    if (variant === 'dot') {
        return <span className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-current ${colors.text}`} />;
    }

    if (variant === 'block') {
        return (
            <div
                {...clickable}
                style={style}
                className={`absolute left-1 right-1 overflow-hidden rounded-lg border-l-4 border-current/50 px-2 py-1 shadow-sm ${cursor} ${colors.bg} ${colors.text}`}
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
        <div
            {...clickable}
            className={`flex min-w-0 max-w-full items-center gap-1 overflow-hidden rounded-md px-1.5 py-0.5 text-[11px] font-medium ${cursor} ${colors.bg} ${colors.text}`}
        >
            {!event.allDay && <span className="shrink-0 opacity-70">{format(event.start, 'HH:mm')}</span>}
            <span className="min-w-0 truncate leading-tight">{event.title}</span>
        </div>
    );
}
