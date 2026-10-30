import { useState } from 'react';
import { MoreVertical, Pencil, Trash2, MailPlus, Loader2 } from 'lucide-react';
import EstadoBadge from './EstadoBadge';

/**
 * Los handlers de acciones son opcionales: cada botón solo aparece si recibió
 * su handler (según los permisos del usuario). `onEliminar(solicitud)` abre la
 * confirmación en la página.
 */
export default function ListaSolicitudes({ solicitudes, selectedId, onSelect, onAceptar, onRechazar, onEditar, onEnviarDetalles, onEliminar, hayBusqueda }) {
    const [menuAbiertoId, setMenuAbiertoId] = useState(null);
    const [enviandoId, setEnviandoId] = useState(null);

    if (solicitudes.length === 0) {
        return (
            <div className="h-full flex items-center justify-center p-6">
                <p className="text-sm text-foreground-faint text-center">
                    {hayBusqueda ? 'Ninguna solicitud coincide con la búsqueda o el filtro.' : 'No hay solicitudes por el momento.'}
                </p>
            </div>
        );
    }

    const handleEditar = (solicitud) => {
        setMenuAbiertoId(null);
        onEditar(solicitud);
    };

    const handleEnviarDetalles = async (solicitud) => {
        setMenuAbiertoId(null);
        setEnviandoId(solicitud.id);
        await onEnviarDetalles(solicitud.id);
        setEnviandoId(null);
    };

    const handleEliminar = (solicitud) => {
        setMenuAbiertoId(null);
        onEliminar(solicitud);
    };

    return (
        <ul className="p-3 space-y-2">
            {solicitudes.map((solicitud) => {
                const seleccionada = solicitud.id === selectedId;
                const menuAbierto = menuAbiertoId === solicitud.id;
                const decidible = solicitud.estado === 'pendiente' && onAceptar && onRechazar;
                // Una solicitud rechazada no se edita ni se le envían detalles.
                const editable = solicitud.estado !== 'rechazada';
                const opcionesMenu = {
                    editar: editable && Boolean(onEditar),
                    enviar: editable && Boolean(onEnviarDetalles),
                    eliminar: Boolean(onEliminar),
                };
                const hayMenu = Object.values(opcionesMenu).some(Boolean);

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
                            <div className="min-w-0">
                                <span className={`block truncate text-sm font-medium ${seleccionada ? 'text-primary' : 'text-foreground'}`}>
                                    {solicitud.agrupacion.nombre}
                                </span>
                                <span className="block text-xs text-foreground-faint">
                                    {solicitud.evento.nombre}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                {decidible ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); onAceptar(solicitud.id); }}
                                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-on-primary hover:bg-primary-hover transition-colors cursor-pointer"
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

                                {hayMenu && (
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
                                                    {opcionesMenu.editar && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleEditar(solicitud)}
                                                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground-soft hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                                                        >
                                                            <Pencil size={14} />
                                                            Editar
                                                        </button>
                                                    )}
                                                    {opcionesMenu.enviar && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleEnviarDetalles(solicitud)}
                                                            disabled={enviandoId === solicitud.id}
                                                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground-soft hover:bg-primary/10 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            {enviandoId === solicitud.id ? (
                                                                <Loader2 size={14} className="animate-spin" />
                                                            ) : (
                                                                <MailPlus size={14} />
                                                            )}
                                                            Enviar detalles
                                                        </button>
                                                    )}
                                                    {opcionesMenu.eliminar && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleEliminar(solicitud)}
                                                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-danger hover:bg-danger-soft rounded-lg transition-colors cursor-pointer"
                                                        >
                                                            <Trash2 size={14} />
                                                            Eliminar
                                                        </button>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}
