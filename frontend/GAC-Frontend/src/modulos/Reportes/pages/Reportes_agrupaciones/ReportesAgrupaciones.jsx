import { useEffect, useState } from 'react';
import { Loader2, Inbox, CheckCircle, XCircle, Clock, Printer } from 'lucide-react';
import { obtenerReporteAgrupaciones } from '../../services/reporteService';
import TarjetaEstadistica from '../../components/Reportes_agrupaciones/TarjetaEstadistica';
import GraficoSolicitudesPorMes from '../../components/Reportes_agrupaciones/GraficoSolicitudesPorMes';
import GraficoTopMeses from '../../components/Reportes_agrupaciones/GraficoTopMeses';

export default function ReportesAgrupaciones() {
    const [reporte, setReporte] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        (async () => {
            const result = await obtenerReporteAgrupaciones();
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
                <h2 className="text-lg font-semibold text-foreground">Reportes de Agrupaciones</h2>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <TarjetaEstadistica icon={Inbox} label="Solicitudes recibidas" value={reporte.recibidas} variant="primary" />
                    <TarjetaEstadistica icon={CheckCircle} label="Aceptadas" value={reporte.aceptadas} variant="success" />
                    <TarjetaEstadistica icon={XCircle} label="Rechazadas" value={reporte.rechazadas} variant="danger" />
                    <TarjetaEstadistica icon={Clock} label="Pendientes" value={reporte.pendientes} variant="warning" />
                </div>
            )}

            {!loading && !error && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <GraficoSolicitudesPorMes datos={reporte.porMes} />
                    <GraficoTopMeses datos={reporte.porMes} />
                </div>
            )}
        </div>
    );
}
