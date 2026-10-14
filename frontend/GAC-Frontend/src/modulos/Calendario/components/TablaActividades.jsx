import { Pencil, Trash2 } from 'lucide-react';
import EstadoActividadBadge from './EstadoActividadBadge';
import { formatearFecha } from '../lib/fechas';

export default function TablaActividades({ actividades, soloLectura = false, embebida = false, onEdit, onDelete }) {
    // Embebida: ocupa toda la fila de la tabla de eventos; la primera columna se alinea
    // con el nombre del evento y la última con sus acciones.
    const celda = embebida ? 'px-3 first:pl-11 last:pr-4' : 'px-3';

    return (
        <div className={embebida ? 'overflow-x-auto bg-background/40' : 'overflow-x-auto rounded-lg border border-border bg-surface'}>
            <table className="w-full min-w-[720px] text-sm">
                <thead className={embebida ? 'border-b border-border' : 'bg-background border-b border-border'}>
                    <tr className="text-left text-[11px] uppercase tracking-wider text-foreground-faint">
                        <th className={`${celda} py-2 font-semibold`}>Actividad</th>
                        <th className={`${celda} py-2 font-semibold`}>Fecha</th>
                        <th className={`${celda} py-2 font-semibold`}>Horario</th>
                        <th className={`${celda} py-2 font-semibold`}>Ubicación</th>
                        <th className={`${celda} py-2 font-semibold`}>Agrupación</th>
                        <th className={`${celda} py-2 font-semibold`}>Estado</th>
                        {!soloLectura && <th className={`${celda} py-2 font-semibold text-right`}>Acciones</th>}
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {actividades.map((actividad) => (
                        <tr key={actividad.id_actividad} className="hover:bg-background/60 transition-colors">
                            <td className={`${celda} py-2.5 font-medium text-foreground`}>{actividad.titulo}</td>
                            <td className={`${celda} py-2.5 text-foreground-soft whitespace-nowrap`}>{formatearFecha(actividad.fecha)}</td>
                            <td className={`${celda} py-2.5 text-foreground-soft whitespace-nowrap`}>
                                {actividad.hora_inicio} – {actividad.hora_finalizacion}
                            </td>
                            <td className={`${celda} py-2.5 text-foreground-soft`}>{actividad.ubicacion?.nombre ?? '—'}</td>
                            <td className={`${celda} py-2.5 text-foreground-soft`}>{actividad.agrupacion?.nombre ?? '—'}</td>
                            <td className={`${celda} py-2.5`}><EstadoActividadBadge estado={actividad.estado} /></td>
                            {!soloLectura && (
                                <td className={`${celda} py-2.5`}>
                                    <div className="flex justify-end gap-1">
                                        <button
                                            type="button"
                                            onClick={() => onEdit(actividad)}
                                            aria-label={`Editar ${actividad.titulo}`}
                                            title="Editar actividad"
                                            className="rounded-md p-1.5 text-foreground-faint transition-colors hover:bg-primary/10 hover:text-primary cursor-pointer"
                                        >
                                            <Pencil size={15} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onDelete(actividad)}
                                            aria-label={`Eliminar ${actividad.titulo}`}
                                            title="Eliminar actividad"
                                            className="rounded-md p-1.5 text-foreground-faint transition-colors hover:bg-danger-soft hover:text-danger cursor-pointer"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
