import { useState } from 'react';
import { Printer, RefreshCw } from 'lucide-react';
import FiltrosReporteBeneficios from '../components/FiltrosReporteBeneficios';
import ReporteAlimentacion from '../components/ReporteAlimentacion';
import ReporteMobiliario from '../components/ReporteMobiliario';
import ReporteAulas from '../components/ReporteAulas';
import ReporteTransporte from '../components/ReporteTransporte';
import ResumenReporteBeneficios from '../components/ResumenReporteBeneficios';
import { obtenerReporteBeneficios } from '../services/reporteBeneficiosService';
import { formatearFecha } from '../../../utils/fecha';

const ETIQUETA_CATEGORIA = {
    todos: 'Todos',
    alimentacion: 'Alimentación',
    mobiliario: 'Mobiliario',
    aula: 'Aula',
    transporte: 'Transporte',
};

export default function ReportesBeneficios() {
    const [reporte, setReporte] = useState(null);
    const [filtrosAplicados, setFiltrosAplicados] = useState(null);
    const [generando, setGenerando] = useState(false);
    const [error, setError] = useState('');

    const handleGenerar = async (filtros) => {
        setGenerando(true);
        setError('');
        const resultado = await obtenerReporteBeneficios(filtros);
        setGenerando(false);

        if (!resultado.success) {
            setError(resultado.error);
            setReporte(null);
            return;
        }

        setReporte(resultado.data);
        setFiltrosAplicados(filtros);
    };

    const secciones = reporte
        ? ['alimentacion', 'mobiliario', 'aula', 'transporte'].filter((clave) => reporte[clave])
        : [];
    const totalRegistros = secciones.reduce((acc, clave) => acc + (reporte[clave]?.detalle?.length ?? 0), 0);
    const sinResultados = reporte !== null && totalRegistros === 0;

    return (
        <div className="space-y-5">
            <div className="print:hidden">
                <p className="text-sm text-foreground-faint">Beneficios</p>
                <h1 className="text-2xl font-bold text-primary">Reportes de beneficios</h1>
                <p className="mt-1 text-sm text-foreground-soft">Genera reportes de beneficios asignados por periodo, categoría y tipo.</p>
            </div>

            <div className="print:hidden">
                <FiltrosReporteBeneficios generando={generando} onGenerar={handleGenerar} />
            </div>

            {error && (
                <div role="alert" className="print:hidden p-3 bg-danger-soft border border-danger/30 rounded-lg text-danger text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <span>{error}</span>
                    <button type="button" onClick={() => filtrosAplicados && handleGenerar(filtrosAplicados)} className="inline-flex items-center justify-center gap-2 px-3 py-1.5 border border-danger/40 rounded-lg font-medium hover:bg-danger/10 transition-colors cursor-pointer">
                        <RefreshCw size={14} />Reintentar
                    </button>
                </div>
            )}

            {reporte && filtrosAplicados && (
                <div className="space-y-6">
                    <div className="hidden print:block text-center">
                        <h2 className="text-xl font-bold">CTP de Corralillo</h2>
                    </div>

                    <div className="bg-surface border border-border rounded-xl p-4 sm:p-6 print:border-0 print:p-0 print:bg-transparent">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <h2 className="text-xl font-bold text-foreground">Reporte de beneficios</h2>
                                <p className="mt-1 text-sm text-foreground-soft">
                                    Periodo: {formatearFecha(filtrosAplicados.fecha_desde)} - {formatearFecha(filtrosAplicados.fecha_hasta)}
                                </p>
                                <p className="text-sm text-foreground-soft">
                                    Categoría: {ETIQUETA_CATEGORIA[filtrosAplicados.categoria] ?? filtrosAplicados.categoria}
                                </p>
                                {filtrosAplicados.categoria === 'alimentacion' && (
                                    <p className="text-sm text-foreground-soft">
                                        Tipo: {filtrosAplicados.tipo_alimentacion || 'Todos'}
                                    </p>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="print:hidden inline-flex items-center gap-2 px-4 py-2 border border-primary text-primary hover:bg-primary/10 rounded-lg font-semibold transition-colors cursor-pointer"
                            >
                                <Printer size={16} />Imprimir reporte
                            </button>
                        </div>
                    </div>

                    {sinResultados ? (
                        <div className="flex items-center justify-center py-16 border border-border rounded-xl bg-surface">
                            <p className="text-sm text-foreground-faint text-center">No hay beneficios asignados para los filtros seleccionados.</p>
                        </div>
                    ) : (
                        <>
                            {reporte.alimentacion && <ReporteAlimentacion seccion={reporte.alimentacion} />}
                            {reporte.mobiliario && <ReporteMobiliario seccion={reporte.mobiliario} />}
                            {reporte.aula && <ReporteAulas seccion={reporte.aula} />}
                            {reporte.transporte && <ReporteTransporte seccion={reporte.transporte} />}
                            <ResumenReporteBeneficios resumen={reporte.resumen} />
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
