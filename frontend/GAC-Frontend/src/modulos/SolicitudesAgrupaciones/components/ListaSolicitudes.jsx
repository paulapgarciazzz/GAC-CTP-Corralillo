import EstadoBadge from './EstadoBadge';

export default function ListaSolicitudes({ solicitudes, selectedId, onSelect, onAceptar, onRechazar }) {
    if (solicitudes.length === 0) {
        return (
            <div className="h-full flex items-center justify-center p-6">
                <p className="text-sm text-gray-400 text-center">No hay solicitudes por el momento.</p>
            </div>
        );
    }

    return (
        <ul className="p-3 space-y-2">
            {solicitudes.map((solicitud) => {
                const seleccionada = solicitud.id === selectedId;
                return (
                    <li key={solicitud.id}>
                        <div
                            onClick={() => onSelect(solicitud.id)}
                            className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors ${
                                seleccionada
                                    ? 'bg-[#adec83]/20 border-l-2 border-[#adec83]'
                                    : 'bg-white/5 hover:bg-white/10 border-l-2 border-transparent'
                            }`}
                        >
                            <span className={`truncate text-sm font-medium ${seleccionada ? 'text-[#adec83]' : 'text-gray-200'}`}>
                                {solicitud.agrupacion.nombre}
                            </span>

                            {solicitud.estado === 'pendiente' ? (
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); onAceptar(solicitud.id); }}
                                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#adec83] text-gray-900 hover:bg-[#9ddb73] transition-colors cursor-pointer"
                                    >
                                        Aceptar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); onRechazar(solicitud.id); }}
                                        className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-red-400 text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                                    >
                                        Rechazar
                                    </button>
                                </div>
                            ) : (
                                <div className="shrink-0">
                                    <EstadoBadge estado={solicitud.estado} />
                                </div>
                            )}
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}
