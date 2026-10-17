import { ShieldCheck, User } from 'lucide-react';

const BASE = 'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap';

export function InsigniaRol({ esAdmin }) {
    return esAdmin ? (
        <span className={`${BASE} bg-info-soft text-info`}><ShieldCheck size={12} aria-hidden="true" />Administrador</span>
    ) : (
        <span className={`${BASE} bg-background text-foreground-soft border border-border`}><User size={12} aria-hidden="true" />Usuario</span>
    );
}

export function InsigniaEstado({ activo }) {
    return (
        <span className={`${BASE} ${activo ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'}`}>
            <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${activo ? 'bg-success' : 'bg-danger'}`} />
            {activo ? 'Activo' : 'Inactivo'}
        </span>
    );
}
