import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const formatearMes = (mes) => {
    const [anio, mesNumero] = mes.split('-');
    const fecha = new Date(Number(anio), Number(mesNumero) - 1, 1);
    return fecha.toLocaleDateString('es-CR', { month: 'short', year: 'numeric' });
};

export default function GraficoSolicitudesPorMes({ datos }) {
    if (!datos || datos.length === 0) {
        return (
            <div className="bg-surface border border-border rounded-lg shadow-sm p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Solicitudes recibidas por mes</h3>
                <p className="text-sm text-foreground-faint text-center py-16">No hay datos suficientes todavía.</p>
            </div>
        );
    }

    const datosFormateados = datos.map((item) => ({ ...item, etiqueta: formatearMes(item.mes) }));

    return (
        <div className="bg-surface border border-border rounded-lg shadow-sm p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Solicitudes recibidas por mes</h3>
            <ResponsiveContainer width="100%" height={260}>
                <BarChart data={datosFormateados} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                    <CartesianGrid vertical={false} stroke="var(--color-border)" />
                    <XAxis
                        dataKey="etiqueta"
                        tick={{ fill: 'var(--color-foreground-faint)', fontSize: 12 }}
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
                        formatter={(value) => [value, 'Solicitudes']}
                    />
                    <Bar dataKey="total" fill="var(--color-primary)" radius={[4, 4, 0, 0]} maxBarSize={24} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
