import EstadoBadge from '../../SolicitudesAgrupaciones/components/EstadoBadge';
import { formatearFecha } from '../../../utils/fecha';

function Dato({ label, value }) {
    return (
        <div>
            <p className="text-[11px] uppercase tracking-wider text-foreground-faint">{label}</p>
            <p className="text-sm text-foreground-soft truncate">{value || '—'}</p>
        </div>
    );
}

export default function ListaSolicitudesAprobadas({ solicitudes, onSeleccionar, hayFiltrosActivos }) {
    if (solicitudes.length === 0) {
        return (
            <div className="flex items-center justify-center py-16 border border-border rounded-xl bg-surface">
                <p className="text-sm text-foreground-faint text-center">
                    {hayFiltrosActivos ? 'Ninguna solicitud aprobada coincide con los filtros.' : 'No hay solicitudes aprobadas por el momento.'}
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {solicitudes.map((solicitud) => {
                const asignada = Boolean(solicitud.asignacion);
                const encargado = solicitud.encargado ?? solicitud.agrupacion?.encargado;

                return (
                    <article
                        key={solicitud.id}
                        onClick={() => onSeleccionar(solicitud)}
                        className="bg-surface border border-border rounded-xl shadow-sm p-4 flex flex-col gap-4 hover:shadow-md transition-shadow cursor-pointer"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-xs font-medium text-primary uppercase tracking-wider">Solicitud #{solicitud.id}</p>
                                <h3 className="mt-1 text-base font-semibold text-foreground truncate">{solicitud.agrupacion?.nombre}</h3>
                            </div>
                            <EstadoBadge estado={solicitud.estado} />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Dato label="Encargado" value={encargado ? `${encargado.primer_nombre} ${encargado.apellido}` : '—'} />
                            <Dato label="Cédula" value={encargado?.cedula} />
                            <Dato label="Fecha solicitada" value={formatearFecha(solicitud.fecha_solicitada) ?? '—'} />
                            <Dato label="Fecha asignada" value={formatearFecha(solicitud.fecha_asignada) ?? 'Sin asignar'} />
                        </div>

                        <div className="pt-2 border-t border-border space-y-1">
                            <p className="text-[11px] uppercase tracking-wider text-foreground-faint">Solicitud de beneficios</p>
                            <p className="text-sm text-foreground-soft italic line-clamp-3">
                                {solicitud.comentarios ? `"${solicitud.comentarios}"` : 'Sin comentario'}
                            </p>
                        </div>

                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold w-fit ${
                            asignada ? 'bg-success-soft text-success' : 'bg-warning-soft text-warning'
                        }`}>
                            {asignada ? 'Ya asignada' : 'Pendiente de asignar'}
                        </div>
                    </article>
                );
            })}
        </div>
    );
}
