const VARIANTES = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success-soft text-success',
    warning: 'bg-warning-soft text-warning',
    danger: 'bg-danger-soft text-danger',
    info: 'bg-info-soft text-info',
};

export default function TarjetaEstadistica({ icon: Icon, label, value, variant = 'primary' }) {
    return (
        <div className="bg-surface border border-border rounded-lg shadow-sm p-4 flex items-center gap-3">
            <div className={`shrink-0 w-11 h-11 rounded-lg flex items-center justify-center ${VARIANTES[variant]}`}>
                <Icon size={22} />
            </div>
            <div className="min-w-0">
                <p className="text-2xl font-bold text-foreground leading-tight">{value}</p>
                <p className="text-xs text-foreground-faint truncate">{label}</p>
            </div>
        </div>
    );
}
