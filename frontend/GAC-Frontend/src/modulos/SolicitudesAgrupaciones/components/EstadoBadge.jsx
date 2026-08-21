const ESTILOS = {
    aprobada: 'bg-[#adec83]/20 text-[#adec83]',
    rechazada: 'bg-red-500/20 text-red-400',
    pendiente: 'bg-gray-500/20 text-gray-300',
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
