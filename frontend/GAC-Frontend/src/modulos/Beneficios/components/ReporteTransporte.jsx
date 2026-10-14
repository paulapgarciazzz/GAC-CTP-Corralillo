import { formatearFecha } from '../../../utils/fecha';

export default function ReporteTransporte({ seccion }) {
    const { detalle, totales } = seccion;

    return (
        <section className="space-y-3">
            <h3 className="text-lg font-bold text-foreground">Transporte</h3>

            {detalle.length === 0 ? (
                <p className="text-sm text-foreground-faint italic">Sin asignaciones de transporte en este periodo.</p>
            ) : (
                <>
                    <div className="overflow-x-auto border border-border rounded-xl">
                        <table className="w-full text-sm">
                            <thead className="bg-surface text-foreground-soft">
                                <tr>
                                    <th className="text-left px-4 py-2 font-semibold whitespace-nowrap">Agrupación</th>
                                    <th className="text-left px-4 py-2 font-semibold whitespace-nowrap">Matrícula</th>
                                    <th className="text-left px-4 py-2 font-semibold whitespace-nowrap">Tipo de vehículo</th>
                                    <th className="text-left px-4 py-2 font-semibold whitespace-nowrap">Capacidad</th>
                                    <th className="text-left px-4 py-2 font-semibold whitespace-nowrap">Conductor</th>
                                    <th className="text-left px-4 py-2 font-semibold whitespace-nowrap">Cédula</th>
                                    <th className="text-left px-4 py-2 font-semibold whitespace-nowrap">Ruta</th>
                                    <th className="text-left px-4 py-2 font-semibold whitespace-nowrap">Fecha asignada</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {detalle.map((item, indice) => {
                                    const conductor = `${item.nombre_conductor ?? ''} ${item.apellido_conductor ?? ''}`.trim();
                                    return (
                                        <tr key={item.id_asignacion ?? indice}>
                                            <td className="px-4 py-2 text-foreground whitespace-nowrap">{item.agrupacion ?? '—'}</td>
                                            <td className="px-4 py-2 text-foreground-soft whitespace-nowrap">{item.matricula ?? '—'}</td>
                                            <td className="px-4 py-2 text-foreground-soft whitespace-nowrap">{item.tipo ?? '—'}</td>
                                            <td className="px-4 py-2 text-foreground-soft whitespace-nowrap">{item.capacidad ?? '—'}</td>
                                            <td className="px-4 py-2 text-foreground-soft whitespace-nowrap">{conductor || '—'}</td>
                                            <td className="px-4 py-2 text-foreground-soft whitespace-nowrap">{item.cedula_conductor ?? '—'}</td>
                                            <td className="px-4 py-2 text-foreground-soft whitespace-nowrap">{item.ruta ?? '—'}</td>
                                            <td className="px-4 py-2 text-foreground-soft whitespace-nowrap">{formatearFecha(item.fecha_asignada) ?? '—'}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <p className="text-sm font-semibold text-foreground">Total vehículos asignados: {totales.total_vehiculos_asignados}</p>
                </>
            )}
        </section>
    );
}
