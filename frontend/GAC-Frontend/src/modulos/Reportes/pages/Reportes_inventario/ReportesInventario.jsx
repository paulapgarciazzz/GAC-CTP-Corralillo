import { useEffect, useState } from 'react';
import { Loader2, Utensils, Armchair, School, Bus, Boxes, Printer } from 'lucide-react';
import { obtenerReporteInventario } from '../../services/reporteService';
import TarjetaEstadistica from '../../components/Reportes_agrupaciones/TarjetaEstadistica';

const TARJETAS = {
    alimentacion: { icon: Utensils, variant: 'warning' },
    mobiliario: { icon: Armchair, variant: 'primary' },
    aula: { icon: School, variant: 'info' },
    transporte: { icon: Bus, variant: 'success' },
};

export default function ReportesInventario() {
    const [reporte, setReporte] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        (async () => {
            const result = await obtenerReporteInventario();
            if (result.success) {
                setReporte(result.data);
            } else {
                setError(result.error);
            }
            setLoading(false);
        })();
    }, []);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-foreground">Reportes de Inventario</h2>
                {!loading && !error && (
                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="print:hidden flex items-center gap-2 px-3 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors cursor-pointer"
                    >
                        <Printer size={16} />
                        Imprimir
                    </button>
                )}
            </div>

            {error && (
                <div role="alert" className="p-3 bg-danger-soft border border-danger/30 rounded-lg text-danger text-sm">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="animate-spin text-primary" size={28} />
                </div>
            ) : (
                !error && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {reporte.por_tipo.map((item) => (
                            <TarjetaEstadistica
                                key={item.tipo}
                                icon={TARJETAS[item.tipo].icon}
                                label={`Items de ${item.etiqueta.toLowerCase()}`}
                                value={item.total}
                                variant={TARJETAS[item.tipo].variant}
                            />
                        ))}
                        <TarjetaEstadistica icon={Boxes} label="Total de items ingresados" value={reporte.total_items} variant="primary" />                    </div>
                )
            )}
        </div>
    );
}
