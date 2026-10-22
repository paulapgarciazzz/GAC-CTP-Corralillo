import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const formatearHoraEtiqueta = (hora) => `${String(hora).padStart(2, '0')}:00`;

// Tokens categóricos del tema (validados para claro y oscuro).
const SERIES = [
    { clave: 'entradas', nombre: 'Entradas', color: 'var(--color-chart-1)' },
    { clave: 'salidas', nombre: 'Salidas', color: 'var(--color-chart-2)' },
];

/**
 * Entradas y salidas por hora del día. Solo muestra el rango de horas con
 * movimientos (más una hora a cada lado) para no comprimir las barras en 24
 * columnas casi vacías.
 */
export default function GraficoDistribucionHoraria({ datos }) {
    const conMovimientos = (datos ?? []).filter((item) => item.entradas + item.salidas > 0);

    if (conMovimientos.length === 0) {
        return (
            <div className="bg-surface border border-border rounded-lg shadow-sm p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Entradas y salidas por hora</h3>
                <p className="text-sm text-foreground-faint text-center py-16">No hay datos suficientes todavía.</p>
            </div>
        );
    }

    const desde = Math.max(0, conMovimientos[0].hora - 1);
    const hasta = Math.min(23, conMovimientos[conMovimientos.length - 1].hora + 1);
    const datosFormateados = datos
        .filter((item) => item.hora >= desde && item.hora <= hasta)
        .map((item) => ({ ...item, etiqueta: formatearHoraEtiqueta(item.hora) }));

    return (
        <div className="bg-surface border border-border rounded-lg shadow-sm p-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Entradas y salidas por hora</h3>
            <ResponsiveContainer width="100%" height={260}>
                <BarChart data={datosFormateados} margin={{ top: 8, right: 8, left: 0, bottom: 8 }} barGap={2}>
                    <CartesianGrid vertical={false} stroke="var(--color-border)" />
                    <XAxis
                        dataKey="etiqueta"
                        tick={{ fill: 'var(--color-foreground-faint)', fontSize: 11 }}
                        axisLine={{ stroke: 'var(--color-border)' }}
                        tickLine={false}
                    />
                    <YAxis
                        allowDecimals={false}
                        tick={{ fill: 'var(--color-foreground-faint)', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        cursor={{ fill: 'var(--color-border)', opacity: 0.3 }}
                        contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8 }}
                        labelStyle={{ color: 'var(--color-foreground)' }}
                        itemStyle={{ color: 'var(--color-foreground-soft)' }}
                        formatter={(valor, nombre) => [valor, nombre]}
                    />
                    <Legend
                        iconType="square"
                        formatter={(nombre) => <span style={{ color: 'var(--color-foreground-soft)', fontSize: 12 }}>{nombre}</span>}
                    />
                    {SERIES.map((serie) => (
                        <Bar
                            key={serie.clave}
                            dataKey={serie.clave}
                            name={serie.nombre}
                            fill={serie.color}
                            radius={[4, 4, 0, 0]}
                            maxBarSize={20}
                        />
                    ))}
                </BarChart>
            </ResponsiveContainer>

            <details className="text-sm">
                <summary className="cursor-pointer text-foreground-soft">Ver como tabla</summary>
                <div className="mt-2 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-foreground-soft">
                            <tr>
                                <th className="text-left px-3 py-1 font-semibold">Hora</th>
                                <th className="text-right px-3 py-1 font-semibold">Entradas</th>
                                <th className="text-right px-3 py-1 font-semibold">Salidas</th>
                                <th className="text-right px-3 py-1 font-semibold">Ocupación al cierre de la hora</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {datosFormateados.map((item) => (
                                <tr key={item.hora}>
                                    <td className="px-3 py-1 text-foreground">{item.etiqueta}</td>
                                    <td className="px-3 py-1 text-right text-foreground">{item.entradas}</td>
                                    <td className="px-3 py-1 text-right text-foreground">{item.salidas}</td>
                                    <td className="px-3 py-1 text-right text-foreground">{item.ocupacion}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </details>
        </div>
    );
}
