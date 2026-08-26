const ESTILOS = {
    aprobada: 'bg-success-soft text-success',
    rechazada: 'bg-danger-soft text-danger',
    pendiente: 'bg-warning-soft text-warning',
};

const ETIQUETAS = {
    aprobada: 'Aprobada',
    rechazada: 'Rechazada',
    pendiente: 'Pendiente',
};

export default function EstadoBadge({ estado }) {
    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${ESTILOS[estado] || ESTILOS.pendiente}`}>
            {ETIQUETAS[estado] || estado}
        </span>
    );
}
