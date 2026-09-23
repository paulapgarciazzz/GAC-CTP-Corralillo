import { formatearFecha } from '../../../utils/fecha';

export default function ReporteMobiliario({ seccion }) {
    const { detalle, totales_por_tipo: totalesPorTipo, total_general: totalGeneral } = seccion;

    return (
        <section className="space-y-3">
            <h3 className="text-lg font-bold text-foreground">Mobiliario</h3>

            {detalle.length === 0 ? (
                <p className="text-sm text-foreground-faint italic">Sin asignaciones de mobiliario en este periodo.</p>
            ) : (
                <>
                    <div className="overflow-x-auto border border-border rounded-xl">
                        <table className="w-full text-sm">
                            <thead className="bg-surface text-foreground-soft">
                                <tr>
                                    <th className="text-left px-4 py-2 font-semibold whitespace-nowrap">Agrupación</th>
                                    <th className="text-left px-4 py-2 font-semibold whitespace-nowrap">Mobiliario</th>
                                    <th className="text-left px-4 py-2 font-semibold whitespace-nowrap">Cantidad asignada</th>
                                    <th className="text-left px-4 py-2 font-semibold whitespace-nowrap">Encargado del mobiliario</th>
                                    <th className="text-left px-4 py-2 font-semibold whitespace-nowrap">Fecha asignada</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {detalle.map((item, indice) => (
                                    <tr key={item.id_asignacion ?? indice}>
                                        <td className="px-4 py-2 text-foreground whitespace-nowrap">{item.agrupacion ?? '—'}</td>
                                        <td className="px-4 py-2 text-foreground-soft whitespace-nowrap">{item.mobiliario ?? '—'}</td>
                                        <td className="px-4 py-2 text-foreground-soft whitespace-nowrap">{item.cantidad}</td>
                                        <td className="px-4 py-2 text-foreground-soft whitespace-nowrap">{item.encargado || '—'}</td>
                                        <td className="px-4 py-2 text-foreground-soft whitespace-nowrap">{formatearFecha(item.fecha_asignada) ?? '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-surface border border-border rounded-xl p-4 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                        {totalesPorTipo.map((item) => (
                            <p key={item.mobiliario} className="text-sm text-foreground-soft">
                                <span className="font-semibold text-foreground">{item.mobiliario}:</span> {item.total}
                            </p>
                        ))}
                    </div>

                    <p className="text-sm font-semibold text-foreground">Total general de unidades: {totalGeneral}</p>
                </>
            )}
        </section>
    );
}
