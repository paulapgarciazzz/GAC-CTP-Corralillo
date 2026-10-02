const ESTADOS = {
    proximamente: { label: 'Próximamente', className: 'bg-info-soft text-info' },
    'en progreso': { label: 'En progreso', className: 'bg-warning-soft text-warning' },
    finalizada: { label: 'Finalizada', className: 'bg-success-soft text-success' },
};

export default function EstadoActividadBadge({ estado }) {
    const config = ESTADOS[estado?.nombre] ?? { label: estado?.nombre ?? '—', className: 'bg-background text-foreground-faint' };

    return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap ${config.className}`}>
            {config.label}
        </span>
    );
}
