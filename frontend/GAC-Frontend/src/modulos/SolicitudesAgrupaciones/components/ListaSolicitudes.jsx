import { useState } from 'react';
import { MoreVertical, Pencil, Trash2, MailPlus } from 'lucide-react';
import EstadoBadge from './EstadoBadge';

export default function ListaSolicitudes({ solicitudes, selectedId, onSelect, onAceptar, onRechazar, onEditar, onEliminar, hayBusqueda }) {
    const [menuAbiertoId, setMenuAbiertoId] = useState(null);

    if (solicitudes.length === 0) {
        return (
            <div className="h-full flex items-center justify-center p-6">
                <p className="text-sm text-foreground-faint text-center">
                    {hayBusqueda ? 'Ninguna agrupación coincide con la búsqueda.' : 'No hay solicitudes por el momento.'}
                </p>
            </div>
        );
    }

    const handleEditar = (solicitud) => {
        setMenuAbiertoId(null);
        onEditar(solicitud);
    };

    const handleEnviarDetalles = (solicitud) => {
        setMenuAbiertoId(null);
        // TODO: implementar envío de detalles al encargado
        console.log('Enviar detalles de la solicitud', solicitud.id);
    };

    const handleEliminar = (solicitud) => {
        setMenuAbiertoId(null);
        if (window.confirm(`¿Eliminar la solicitud de "${solicitud.agrupacion.nombre}"? Esta acción no se puede deshacer.`)) {
            onEliminar(solicitud.id);
        }
    };

    return (
        <ul className="p-3 space-y-2">
            {solicitudes.map((solicitud) => {
                const seleccionada = solicitud.id === selectedId;
                const menuAbierto = menuAbiertoId === solicitud.id;
                return (
                    <li key={solicitud.id}>
                        <div
                            onClick={() => onSelect(solicitud.id)}
                            className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors ${
                                seleccionada
                                    ? 'bg-primary/15 border-l-2 border-primary'
                                    : 'hover:bg-primary/5 border-l-2 border-transparent'
                            }`}
                        >
                            <span className={`truncate text-sm font-medium ${seleccionada ? 'text-primary' : 'text-foreground'}`}>
                                {solicitud.agrupacion.nombre}
                            </span>

                            <div className="flex items-center gap-2 shrink-0">
                                {solicitud.estado === 'pendiente' ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); onAceptar(solicitud.id); }}
                                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer"
                                        >
                                            Aceptar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); onRechazar(solicitud.id); }}
                                            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-danger text-danger hover:bg-danger-soft transition-colors cursor-pointer"
                                        >
                                            Rechazar
                                        </button>
                                    </>
                                ) : (
                                    <EstadoBadge estado={solicitud.estado} />
                                )}

                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); setMenuAbiertoId(menuAbierto ? null : solicitud.id); }}
                                        aria-label="Más opciones"
                                        className="p-1.5 rounded-lg text-foreground-faint hover:bg-primary/10 hover:text-foreground transition-colors cursor-pointer"
                                    >
                                        <MoreVertical size={16} />
                                    </button>

                                    {menuAbierto && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setMenuAbiertoId(null); }} />
                                            <div
                                                onClick={(e) => e.stopPropagation()}
                                                className="absolute right-0 mt-1 w-40 bg-surface rounded-lg shadow-lg border border-border z-20 p-1"
                                            >
                                                {solicitud.estado !== 'rechazada' && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleEditar(solicitud)}
                                                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground-soft hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                                                        >
                                                            <Pencil size={14} />
                                                            Editar
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleEnviarDetalles(solicitud)}
                                                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground-soft hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                                                        >
                                                            <MailPlus size={14} />
                                                            Enviar detalles
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => handleEliminar(solicitud)}
                                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-danger hover:bg-danger-soft rounded-lg transition-colors cursor-pointer"
                                                >
                                                    <Trash2 size={14} />
                                                    Eliminar
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}
