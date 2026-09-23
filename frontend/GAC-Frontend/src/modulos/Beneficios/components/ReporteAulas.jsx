import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { formatearFecha } from '../../../utils/fecha';

export default function ReporteAulas({ seccion }) {
    const { detalle, totales } = seccion;

    return (
        <section className="space-y-3">
            <h3 className="text-lg font-bold text-foreground">Aulas</h3>

            {detalle.length === 0 ? (
                <p className="text-sm text-foreground-faint italic">Sin asignaciones de aulas en este periodo.</p>
            ) : (
                <>
                    <div className="overflow-x-auto border border-border rounded-xl">
                        <table className="w-full text-sm">
                            <thead className="bg-surface text-foreground-soft">
                                <tr>
                                    <th className="text-left px-4 py-2 font-semibold whitespace-nowrap">Agrupación</th>
                                    <th className="text-left px-4 py-2 font-semibold whitespace-nowrap">Aula</th>
                                    <th className="text-left px-4 py-2 font-semibold whitespace-nowrap">Encargado</th>
                                    <th className="text-left px-4 py-2 font-semibold whitespace-nowrap">Capacidad</th>
                                    <th className="text-left px-4 py-2 font-semibold whitespace-nowrap">Integrantes</th>
                                    <th className="text-left px-4 py-2 font-semibold whitespace-nowrap">Fecha asignada</th>
                                    <th className="text-left px-4 py-2 font-semibold whitespace-nowrap">Estado de capacidad</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {detalle.map((item, indice) => (
                                    <tr key={item.id_asignacion ?? indice}>
                                        <td className="px-4 py-2 text-foreground whitespace-nowrap">{item.agrupacion ?? '—'}</td>
                                        <td className="px-4 py-2 text-foreground-soft whitespace-nowrap">{item.aula ?? '—'}</td>
                                        <td className="px-4 py-2 text-foreground-soft whitespace-nowrap">{item.encargado || '—'}</td>
                                        <td className="px-4 py-2 text-foreground-soft whitespace-nowrap">{item.capacidad ?? '—'}</td>
                                        <td className="px-4 py-2 text-foreground-soft whitespace-nowrap">{item.cantidad_integrantes ?? '—'}</td>
                                        <td className="px-4 py-2 text-foreground-soft whitespace-nowrap">{formatearFecha(item.fecha_asignada) ?? '—'}</td>
                                        <td className="px-4 py-2 whitespace-nowrap">
                                            {item.sobrecapacidad ? (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-danger-soft text-danger text-xs font-semibold">
                                                    <AlertTriangle size={14} />
                                                    Capacidad sobrepasada — Exceso: {item.exceso}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-success-soft text-success text-xs font-semibold">
                                                    <CheckCircle2 size={14} />
                                                    Capacidad adecuada
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-surface border border-border rounded-xl p-4 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-4">
                        <p className="text-sm text-foreground-soft"><span className="font-semibold text-foreground">Total aulas asignadas:</span> {totales.total_aulas_asignadas}</p>
                        <p className="text-sm text-foreground-soft"><span className="font-semibold text-foreground">Capacidad total:</span> {totales.capacidad_total}</p>
                        <p className="text-sm text-foreground-soft"><span className="font-semibold text-foreground">Personas alojadas:</span> {totales.total_personas_alojadas}</p>
                        <p className="text-sm text-foreground-soft"><span className="font-semibold text-foreground">Con sobrecapacidad:</span> {totales.asignaciones_con_sobrecapacidad}</p>
                    </div>
                </>
            )}
        </section>
    );
}
