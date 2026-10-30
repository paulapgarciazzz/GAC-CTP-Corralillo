import { useState } from 'react';
import { Loader2, TrendingUp } from 'lucide-react';
import GraficoDistribucionHoraria from '../components/GraficoDistribucionHoraria';
import { obtenerReporteConteo } from '../services/conteoService';
import { obtenerFechaCostaRicaISO } from '../../../utils/fecha';

function formatearFechaVisual(fechaISO) {
    if (!fechaISO) return '—';
    const [anio, mes, dia] = fechaISO.split('-');
    return `${dia}/${mes}/${anio}`;
}

function formatearHora(hora) {
    if (hora === null || hora === undefined) return null;
    return `${String(hora).padStart(2, '0')}:00`;
}

function TarjetaReporte({ etiqueta, valor }) {
    return (
        <div className="bg-surface border border-border rounded-xl p-5">
            <p className="text-xs font-medium text-foreground-faint uppercase tracking-wider">{etiqueta}</p>
            <p className="mt-1 text-3xl font-bold text-foreground">{valor}</p>
        </div>
    );
}

export default function ReportesConteo() {
    const [fecha, setFecha] = useState(() => obtenerFechaCostaRicaISO());
    const [reporte, setReporte] = useState(null);
    const [generando, setGenerando] = useState(false);
    const [error, setError] = useState('');

    const handleGenerar = async () => {
        if (!fecha) {
            setError('Selecciona una fecha.');
            return;
        }

        setGenerando(true);
        setError('');
        const resultado = await obtenerReporteConteo(fecha);
        setGenerando(false);

        if (!resultado.success) {
            setError(resultado.error);
            setReporte(null);
            return;
        }

        setReporte(resultado.data);
    };

    const sinDatos = reporte !== null && reporte.entradas === 0 && reporte.salidas === 0;

    return (
        <div className="space-y-5">
            <div>
                <p className="text-sm text-foreground-faint">Conteo</p>
                <h1 className="text-2xl font-semibold text-foreground">Reportes de conteo</h1>
                <p className="mt-1 text-sm text-foreground-soft">Estadísticas de entradas y salidas para una fecha específica.</p>
            </div>

            <div className="bg-surface border border-border rounded-xl p-4 sm:p-5 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-1">
                        <label htmlFor="reporte-conteo-fecha" className="block text-sm font-semibold text-foreground">
                            Fecha
                        </label>
                        <input
                            id="reporte-conteo-fecha"
                            type="date"
                            value={fecha}
                            onChange={(event) => setFecha(event.target.value)}
                            disabled={generando}
                            className="w-full px-3 py-2 border border-border-input rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed"
                        />
                    </div>
                </div>

                {error && (
                    <div role="alert" className="p-3 bg-danger-soft border border-danger/30 rounded-lg text-danger text-sm">{error}</div>
                )}

                <button
                    type="button"
                    onClick={handleGenerar}
                    disabled={generando}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed text-on-primary rounded-lg font-semibold transition-colors cursor-pointer"
                >
                    {generando && <Loader2 size={18} className="animate-spin" />}
                    {generando ? 'Generando reporte...' : 'Generar reporte'}
                </button>
            </div>

            {reporte && (
                <div className="space-y-6">
                    <div className="bg-surface border border-border rounded-xl p-4 sm:p-6">
                        <h2 className="text-xl font-semibold text-foreground">Reporte de conteo</h2>
                        <p className="mt-1 text-sm text-foreground-soft">Fecha: {formatearFechaVisual(reporte.fecha)}</p>
                    </div>

                    {sinDatos ? (
                        <div className="flex items-center justify-center py-16 border border-border rounded-xl bg-surface">
                            <p className="text-sm text-foreground-faint text-center">No hay movimientos registrados para esta fecha.</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <TarjetaReporte etiqueta="Total entradas" valor={reporte.entradas} />
                                <TarjetaReporte etiqueta="Total salidas" valor={reporte.salidas} />
                                <TarjetaReporte etiqueta="Ocupación máxima" valor={reporte.ocupacion_maxima} />
                                <TarjetaReporte etiqueta="Ocupación al finalizar el día" valor={reporte.ocupacion_estimada_fin_dia} />
                            </div>

                            <div className="bg-surface border border-border rounded-xl p-4 flex items-start gap-3">
                                <TrendingUp className="text-primary shrink-0 mt-0.5" size={20} />
                                <ul className="text-sm text-foreground space-y-1">
                                    <li>
                                        Hora pico de entradas:{' '}
                                        <span className="font-semibold">{formatearHora(reporte.hora_pico_entradas) ?? 'Sin datos suficientes'}</span>
                                    </li>
                                    <li>
                                        Hora pico de salidas:{' '}
                                        <span className="font-semibold">{formatearHora(reporte.hora_pico_salidas) ?? 'Sin datos suficientes'}</span>
                                    </li>
                                    <li>
                                        Ocupación máxima alcanzada a las:{' '}
                                        <span className="font-semibold">{reporte.hora_ocupacion_maxima ?? 'Sin datos suficientes'}</span>
                                    </li>
                                </ul>
                            </div>

                            <GraficoDistribucionHoraria datos={reporte.distribucion_por_hora} />
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
