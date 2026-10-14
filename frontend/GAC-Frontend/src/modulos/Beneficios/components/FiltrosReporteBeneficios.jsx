import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { obtenerBeneficios } from '../services/beneficioService';
import { calcularRangoMes, calcularRangoSemana, obtenerFechaLocalISO } from '../../../utils/fecha';

const PERIODOS = [
    { value: 'dia', label: 'Día' },
    { value: 'semana', label: 'Semana' },
    { value: 'mes', label: 'Mes' },
    { value: 'rango', label: 'Rango personalizado' },
];

const CATEGORIAS = [
    { value: 'todos', label: 'Todos' },
    { value: 'alimentacion', label: 'Alimentación' },
    { value: 'mobiliario', label: 'Mobiliario' },
    { value: 'aula', label: 'Aula' },
    { value: 'transporte', label: 'Transporte' },
];

const mesActualISO = () => obtenerFechaLocalISO().slice(0, 7);

export default function FiltrosReporteBeneficios({ generando, onGenerar }) {
    const [periodo, setPeriodo] = useState('dia');
    const [fechaDia, setFechaDia] = useState(() => obtenerFechaLocalISO());
    const [fechaSemana, setFechaSemana] = useState(() => obtenerFechaLocalISO());
    const [mesSeleccionado, setMesSeleccionado] = useState(() => mesActualISO());
    const [rangoDesde, setRangoDesde] = useState('');
    const [rangoHasta, setRangoHasta] = useState('');
    const [categoria, setCategoria] = useState('todos');
    const [tipoAlimentacion, setTipoAlimentacion] = useState('');
    const [catalogoAlimentacion, setCatalogoAlimentacion] = useState([]);
    const [cargandoCatalogo, setCargandoCatalogo] = useState(true);
    const [errorLocal, setErrorLocal] = useState('');

    useEffect(() => {
        let activo = true;
        obtenerBeneficios('alimentacion').then((resultado) => {
            if (!activo) return;
            setCatalogoAlimentacion(resultado.success ? resultado.data : []);
            setCargandoCatalogo(false);
        });
        return () => {
            activo = false;
        };
    }, []);

    const calcularFechas = () => {
        if (periodo === 'dia') {
            if (!fechaDia) return { error: 'Selecciona una fecha.' };
            return { fecha_desde: fechaDia, fecha_hasta: fechaDia };
        }

        if (periodo === 'semana') {
            if (!fechaSemana) return { error: 'Selecciona una fecha para calcular la semana.' };
            const { desde, hasta } = calcularRangoSemana(fechaSemana);
            return { fecha_desde: desde, fecha_hasta: hasta };
        }

        if (periodo === 'mes') {
            if (!mesSeleccionado) return { error: 'Selecciona un mes.' };
            const { desde, hasta } = calcularRangoMes(mesSeleccionado);
            return { fecha_desde: desde, fecha_hasta: hasta };
        }

        if (!rangoDesde || !rangoHasta) return { error: 'Selecciona ambas fechas del rango.' };
        if (rangoDesde > rangoHasta) return { error: 'La fecha "Desde" no puede ser posterior a "Hasta".' };
        return { fecha_desde: rangoDesde, fecha_hasta: rangoHasta };
    };

    const handleGenerar = () => {
        setErrorLocal('');
        const resultado = calcularFechas();

        if (resultado.error) {
            setErrorLocal(resultado.error);
            return;
        }

        onGenerar({
            fecha_desde: resultado.fecha_desde,
            fecha_hasta: resultado.fecha_hasta,
            categoria,
            tipo_alimentacion: categoria === 'alimentacion' && tipoAlimentacion ? tipoAlimentacion : undefined,
        });
    };

    return (
        <div className="bg-surface border border-border rounded-xl p-4 sm:p-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1">
                    <label htmlFor="reporte-periodo" className="text-xs font-medium text-foreground-soft uppercase tracking-wider block">
                        Periodo
                    </label>
                    <select
                        id="reporte-periodo"
                        value={periodo}
                        onChange={(event) => setPeriodo(event.target.value)}
                        disabled={generando}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed"
                    >
                        {PERIODOS.map((item) => (
                            <option key={item.value} value={item.value}>{item.label}</option>
                        ))}
                    </select>
                </div>

                {periodo === 'dia' && (
                    <div className="space-y-1">
                        <label htmlFor="reporte-fecha-dia" className="text-xs font-medium text-foreground-soft uppercase tracking-wider block">
                            Fecha
                        </label>
                        <input
                            id="reporte-fecha-dia"
                            type="date"
                            value={fechaDia}
                            onChange={(event) => setFechaDia(event.target.value)}
                            disabled={generando}
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed"
                        />
                    </div>
                )}

                {periodo === 'semana' && (
                    <div className="space-y-1">
                        <label htmlFor="reporte-fecha-semana" className="text-xs font-medium text-foreground-soft uppercase tracking-wider block">
                            Cualquier día de la semana
                        </label>
                        <input
                            id="reporte-fecha-semana"
                            type="date"
                            value={fechaSemana}
                            onChange={(event) => setFechaSemana(event.target.value)}
                            disabled={generando}
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed"
                        />
                    </div>
                )}

                {periodo === 'mes' && (
                    <div className="space-y-1">
                        <label htmlFor="reporte-mes" className="text-xs font-medium text-foreground-soft uppercase tracking-wider block">
                            Mes
                        </label>
                        <input
                            id="reporte-mes"
                            type="month"
                            value={mesSeleccionado}
                            onChange={(event) => setMesSeleccionado(event.target.value)}
                            disabled={generando}
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed"
                        />
                    </div>
                )}

                {periodo === 'rango' && (
                    <>
                        <div className="space-y-1">
                            <label htmlFor="reporte-rango-desde" className="text-xs font-medium text-foreground-soft uppercase tracking-wider block">
                                Desde
                            </label>
                            <input
                                id="reporte-rango-desde"
                                type="date"
                                value={rangoDesde}
                                onChange={(event) => setRangoDesde(event.target.value)}
                                disabled={generando}
                                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed"
                            />
                        </div>
                        <div className="space-y-1">
                            <label htmlFor="reporte-rango-hasta" className="text-xs font-medium text-foreground-soft uppercase tracking-wider block">
                                Hasta
                            </label>
                            <input
                                id="reporte-rango-hasta"
                                type="date"
                                value={rangoHasta}
                                onChange={(event) => setRangoHasta(event.target.value)}
                                disabled={generando}
                                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed"
                            />
                        </div>
                    </>
                )}

                <div className="space-y-1">
                    <label htmlFor="reporte-categoria" className="text-xs font-medium text-foreground-soft uppercase tracking-wider block">
                        Beneficio
                    </label>
                    <select
                        id="reporte-categoria"
                        value={categoria}
                        onChange={(event) => {
                            setCategoria(event.target.value);
                            setTipoAlimentacion('');
                        }}
                        disabled={generando}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed"
                    >
                        {CATEGORIAS.map((item) => (
                            <option key={item.value} value={item.value}>{item.label}</option>
                        ))}
                    </select>
                </div>

                {categoria === 'alimentacion' && (
                    <div className="space-y-1">
                        <label htmlFor="reporte-tipo-alimentacion" className="text-xs font-medium text-foreground-soft uppercase tracking-wider block">
                            Tipo de alimentación
                        </label>
                        <select
                            id="reporte-tipo-alimentacion"
                            value={tipoAlimentacion}
                            onChange={(event) => setTipoAlimentacion(event.target.value)}
                            disabled={generando || cargandoCatalogo}
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed"
                        >
                            <option value="">Todos los tipos</option>
                            {catalogoAlimentacion.map((item) => (
                                <option key={item.id_alimentacion} value={item.tiempo_comida}>{item.tiempo_comida}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {errorLocal && (
                <div role="alert" className="p-3 bg-danger-soft border border-danger/30 rounded-lg text-danger text-sm">{errorLocal}</div>
            )}

            <button
                type="button"
                onClick={handleGenerar}
                disabled={generando}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors cursor-pointer"
            >
                {generando && <Loader2 size={18} className="animate-spin" />}
                {generando ? 'Generando reporte...' : 'Generar reporte'}
            </button>
        </div>
    );
}
