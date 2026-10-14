import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

// Paleta validada (CVD + contraste) para hasta 3 categorías simultáneas en un gráfico
// de pastel; el resto se agrupa en "Otros" con un gris neutro en vez de un 4to color.
const COLORES = ['var(--color-chart-1)', 'var(--color-chart-2)', 'var(--color-chart-3)'];
const COLOR_OTROS = 'var(--color-foreground-faint)';

const formatearMes = (mes) => {
    const [anio, mesNumero] = mes.split('-');
    const fecha = new Date(Number(anio), Number(mesNumero) - 1, 1);
    return fecha.toLocaleDateString('es-CR', { month: 'short', year: 'numeric' });
};

const agruparTopMeses = (datos) => {
    const ordenados = [...datos].sort((a, b) => b.total - a.total);
    const top = ordenados.slice(0, 3).map((item) => ({ nombre: formatearMes(item.mes), total: item.total }));
    const resto = ordenados.slice(3).reduce((suma, item) => suma + item.total, 0);

    return resto > 0 ? [...top, { nombre: 'Otros', total: resto }] : top;
};

export default function GraficoTopMeses({ datos }) {
    if (!datos || datos.length === 0) {
        return (
            <div className="bg-surface border border-border rounded-lg shadow-sm p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Meses con más solicitudes</h3>
                <p className="text-sm text-foreground-faint text-center py-16">No hay datos suficientes todavía.</p>
            </div>
        );
    }

    const datosAgrupados = agruparTopMeses(datos);

    return (
        <div className="bg-surface border border-border rounded-lg shadow-sm p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Meses con más solicitudes</h3>
            <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                    <Pie
                        data={datosAgrupados}
                        dataKey="total"
                        nameKey="nombre"
                        innerRadius={50}
                        outerRadius={90}
                        paddingAngle={2}
                        label={({ nombre, total }) => `${nombre}: ${total}`}
                    >
                        {datosAgrupados.map((entrada, indice) => (
                            <Cell
                                key={entrada.nombre}
                                fill={entrada.nombre === 'Otros' ? COLOR_OTROS : COLORES[indice % COLORES.length]}
                                stroke="var(--color-surface)"
                                strokeWidth={2}
                            />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8 }}
                        labelStyle={{ color: 'var(--color-foreground)' }}
                        itemStyle={{ color: 'var(--color-foreground-soft)' }}
                    />
                    <Legend wrapperStyle={{ color: 'var(--color-foreground-soft)', fontSize: 12 }} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
