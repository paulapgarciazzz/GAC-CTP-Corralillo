const ETIQUETAS = {
    alimentacion: {
        titulo: 'Alimentación',
        campos: { total_general: 'raciones' },
    },
    mobiliario: {
        titulo: 'Mobiliario',
        campos: { total_general: 'unidades' },
    },
    aula: {
        titulo: 'Aulas',
        campos: {
            total_aulas_asignadas: 'asignadas',
            capacidad_total: 'capacidad total',
            total_personas_alojadas: 'personas alojadas',
            asignaciones_con_sobrecapacidad: 'con sobrecapacidad',
        },
    },
    transporte: {
        titulo: 'Transporte',
        campos: { total_vehiculos_asignados: 'vehículos' },
    },
};

export default function ResumenReporteBeneficios({ resumen }) {
    const claves = Object.keys(resumen ?? {});

    if (claves.length === 0) return null;

    return (
        <section className="space-y-3">
            <h3 className="text-lg font-bold text-foreground">Resumen del reporte</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {claves.map((clave) => {
                    const config = ETIQUETAS[clave];
                    const valores = resumen[clave] ?? {};

                    return (
                        <div key={clave} className="bg-surface border border-border rounded-xl p-4">
                            <p className="text-xs font-medium text-foreground-faint uppercase tracking-wider mb-2">{config?.titulo ?? clave}</p>
                            <div className="space-y-1">
                                {Object.entries(valores).map(([campo, valor]) => (
                                    <p key={campo} className="text-sm">
                                        <span className="font-bold text-primary">{String(valor)}</span>{' '}
                                        <span className="text-foreground-soft">{config?.campos?.[campo] ?? campo}</span>
                                    </p>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
