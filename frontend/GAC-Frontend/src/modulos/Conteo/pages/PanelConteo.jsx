import { AlertTriangle, ArrowDownCircle, ArrowUpCircle, KeyRound, Loader2, RefreshCw, Users, Wifi, WifiOff } from 'lucide-react';
import { useConteoEnVivo } from '../hooks/useConteoEnVivo';

function formatearFechaHora(valor) {
    if (!valor) return { fecha: '—', hora: '—' };

    const [fechaParte, horaParte] = valor.split(' ');
    if (!fechaParte) return { fecha: '—', hora: '—' };

    const [anio, mes, dia] = fechaParte.split('-');

    return {
        fecha: `${dia}/${mes}/${anio}`,
        hora: horaParte ? horaParte.slice(0, 5) : '—',
    };
}

function TarjetaOcupacion({ icono: Icono, etiqueta, valor, colorClase }) {
    return (
        <div className="bg-surface border border-border rounded-xl p-5 flex items-center gap-4">
            <div className={`p-3 rounded-full ${colorClase}`}>
                <Icono size={22} />
            </div>
            <div>
                <p className="text-xs font-medium text-foreground-faint uppercase tracking-wider">{etiqueta}</p>
                <p className="text-3xl font-bold text-foreground">{valor}</p>
            </div>
        </div>
    );
}

function BadgeTipo({ tipo }) {
    const esEntrada = tipo === 'entrada';
    const Icono = esEntrada ? ArrowDownCircle : ArrowUpCircle;

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${esEntrada ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'}`}>
            <Icono size={12} />
            {esEntrada ? 'Entrada' : 'Salida'}
        </span>
    );
}

function estadoSensor(sensor) {
    if (!sensor.activo) return { texto: 'Inactivo', clase: 'bg-background text-foreground-faint', Icono: WifiOff };
    if (!sensor.tiene_credenciales) return { texto: 'Sin credenciales', clase: 'bg-warning-soft text-warning', Icono: KeyRound };
    if (sensor.en_linea) return { texto: 'En línea', clase: 'bg-success-soft text-success', Icono: Wifi };
    return { texto: 'Sin señal', clase: 'bg-danger-soft text-danger', Icono: WifiOff };
}

function TarjetaSensor({ sensor }) {
    const { texto, clase, Icono } = estadoSensor(sensor);
    const { fecha, hora } = formatearFechaHora(sensor.ultima_senal_en);

    return (
        <div className="bg-surface border border-border rounded-xl p-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{sensor.nombre}</p>
                <p className="text-xs text-foreground-faint">
                    {sensor.codigo} · {sensor.tipo === 'entrada' ? 'Entrada' : 'Salida'}
                </p>
                <p className="mt-1 text-xs text-foreground-soft">
                    Última señal: {sensor.ultima_senal_en ? `${fecha} ${hora}` : 'nunca'}
                </p>
            </div>
            <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${clase}`}>
                <Icono size={12} />
                {texto}
            </span>
        </div>
    );
}

export default function PanelConteo() {
    const { ocupacion, movimientos, sensores, cargando, error, ultimaActualizacion, reintentar } = useConteoEnVivo();

    return (
        <div className="space-y-5">
            <div>
                <p className="text-sm text-foreground-faint">Conteo</p>
                <h1 className="text-2xl font-bold text-primary">Panel de conteo</h1>
                <p className="mt-1 text-sm text-foreground-soft">Ocupación estimada de la institución, actualizada automáticamente cada 5 segundos.</p>
            </div>

            {error && (
                <div role="alert" className="p-3 bg-danger-soft border border-danger/30 rounded-lg text-danger text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <span className="flex items-center gap-2"><AlertTriangle size={16} />{error}</span>
                    <button type="button" onClick={reintentar} className="inline-flex items-center justify-center gap-2 px-3 py-1.5 border border-danger/40 rounded-lg font-medium hover:bg-danger/10 transition-colors cursor-pointer">
                        <RefreshCw size={14} />Reintentar
                    </button>
                </div>
            )}

            {cargando && !ocupacion ? (
                <div className="flex items-center justify-center gap-2 py-16 text-foreground-soft">
                    <Loader2 className="animate-spin text-primary" size={26} />Cargando ocupación...
                </div>
            ) : !ocupacion ? (
                <div className="flex items-center justify-center py-16 border border-border rounded-xl bg-surface">
                    <p className="text-sm text-foreground-faint text-center">No se pudo obtener la ocupación actual.</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <TarjetaOcupacion icono={ArrowDownCircle} etiqueta="Entradas hoy" valor={ocupacion.entradas_hoy} colorClase="bg-success-soft text-success" />
                        <TarjetaOcupacion icono={ArrowUpCircle} etiqueta="Salidas hoy" valor={ocupacion.salidas_hoy} colorClase="bg-danger-soft text-danger" />
                        <TarjetaOcupacion icono={Users} etiqueta="Ocupación estimada" valor={ocupacion.ocupacion_estimada} colorClase="bg-primary/10 text-primary" />
                    </div>

                    {ultimaActualizacion && (
                        <p className="text-xs text-foreground-faint text-right">
                            Última actualización: {ultimaActualizacion.toLocaleTimeString('es-CR')}
                        </p>
                    )}
                </>
            )}

            {sensores.length > 0 && (
                <div className="space-y-2">
                    <h2 className="text-sm font-semibold text-foreground">Sensores</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {sensores.map((sensor) => <TarjetaSensor key={sensor.id_sensor} sensor={sensor} />)}
                    </div>
                </div>
            )}

            <div className="bg-surface border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                    <h2 className="text-sm font-semibold text-foreground">Últimos movimientos</h2>
                </div>

                {movimientos.length === 0 ? (
                    <p className="text-sm text-foreground-faint text-center py-10">
                        {cargando ? 'Cargando movimientos...' : 'No hay movimientos registrados todavía.'}
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-background text-foreground-soft">
                                <tr>
                                    <th className="text-left px-4 py-2 font-semibold whitespace-nowrap">Fecha</th>
                                    <th className="text-left px-4 py-2 font-semibold whitespace-nowrap">Hora</th>
                                    <th className="text-left px-4 py-2 font-semibold whitespace-nowrap">Sensor</th>
                                    <th className="text-left px-4 py-2 font-semibold whitespace-nowrap">Tipo</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {movimientos.map((movimiento) => {
                                    const { fecha, hora } = formatearFechaHora(movimiento.ocurrido_en);
                                    return (
                                        <tr key={movimiento.id_movimiento}>
                                            <td className="px-4 py-2 text-foreground whitespace-nowrap">{fecha}</td>
                                            <td className="px-4 py-2 text-foreground-soft whitespace-nowrap">{hora}</td>
                                            <td className="px-4 py-2 text-foreground-soft whitespace-nowrap">{movimiento.sensor?.nombre ?? '—'}</td>
                                            <td className="px-4 py-2 whitespace-nowrap"><BadgeTipo tipo={movimiento.tipo} /></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
