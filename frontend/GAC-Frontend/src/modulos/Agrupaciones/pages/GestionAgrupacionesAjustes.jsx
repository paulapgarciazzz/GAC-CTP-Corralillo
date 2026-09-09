import { useEffect, useState } from 'react';
import { AlertTriangle, Loader2, RefreshCw, Trash2, X } from 'lucide-react';
import { eliminarAgrupacion, obtenerAgrupaciones } from '../services/agrupacionService';

function cantidadSolicitudes(agrupacion) {
    return Number(agrupacion.solicitudes_count ?? 0);
}

function textoSolicitudes(cantidad) {
    return `${cantidad} ${cantidad === 1 ? 'solicitud' : 'solicitudes'}`;
}

function nombreEncargado(agrupacion) {
    const encargado = agrupacion.encargado;
    if (!encargado) return 'Sin encargado';
    return [encargado.primer_nombre, encargado.apellido].filter(Boolean).join(' ') || 'Sin encargado';
}

function ConfirmarEliminacion({ agrupacion, loading, error, onClose, onConfirm }) {
    if (!agrupacion) return null;

    const solicitudes = cantidadSolicitudes(agrupacion);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={loading ? undefined : onClose}>
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="titulo-confirmar-eliminacion-agrupacion"
                onClick={(event) => event.stopPropagation()}
                className="w-full max-w-md bg-surface rounded-2xl shadow-2xl p-6 relative"
            >
                <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    aria-label="Cerrar"
                    className="absolute top-4 right-4 text-foreground-faint hover:text-foreground disabled:opacity-50 transition-colors cursor-pointer"
                >
                    <X size={20} />
                </button>
                <div className="flex items-start gap-3 pr-8">
                    <div className="p-2 rounded-full bg-danger-soft text-danger shrink-0">
                        <AlertTriangle size={20} />
                    </div>
                    <div>
                        <h2 id="titulo-confirmar-eliminacion-agrupacion" className="text-lg font-bold text-foreground">Eliminar agrupación</h2>
                        <p className="mt-3 text-sm text-foreground-soft">¿Seguro que deseas eliminar la agrupación <strong className="text-foreground">'{agrupacion.nombre}'</strong>?</p>
                    </div>
                </div>

                <div className="mt-4 p-3 rounded-lg bg-background border border-border text-sm text-foreground-soft space-y-1">
                    {solicitudes === 0 ? (
                        <p>Esta agrupación no tiene solicitudes asociadas.</p>
                    ) : (
                        <>
                            <p>Esta agrupación tiene <strong className="text-foreground">{textoSolicitudes(solicitudes)}</strong> asociadas.</p>
                            <p>Al eliminarla también se eliminarán las solicitudes y registros relacionados.</p>
                            <p className="font-medium text-danger">Esta acción no se puede deshacer.</p>
                        </>
                    )}
                </div>

                {error && <div role="alert" className="mt-4 p-3 bg-danger-soft border border-danger/30 rounded-lg text-danger text-sm">{error}</div>}

                <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                    <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 border border-border text-foreground-soft hover:bg-background disabled:opacity-50 rounded-lg font-medium transition-colors cursor-pointer">Cancelar</button>
                    <button type="button" onClick={onConfirm} disabled={loading} className="px-4 py-2 bg-danger hover:bg-danger/90 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors cursor-pointer flex items-center justify-center gap-2">
                        {loading && <Loader2 size={16} className="animate-spin" />}
                        {loading ? 'Eliminando...' : 'Eliminar agrupación'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function GestionAgrupacionesAjustes() {
    const [agrupaciones, setAgrupaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [mensajeExito, setMensajeExito] = useState('');
    const [agrupacionAEliminar, setAgrupacionAEliminar] = useState(null);
    const [eliminando, setEliminando] = useState(false);
    const [errorEliminacion, setErrorEliminacion] = useState('');

    const cargarAgrupaciones = async () => {
        setLoading(true);
        setError('');
        const resultado = await obtenerAgrupaciones();
        if (resultado.success) {
            setAgrupaciones(Array.isArray(resultado.data) ? resultado.data : []);
        } else {
            setError(resultado.error);
        }
        setLoading(false);
    };

    useEffect(() => {
        cargarAgrupaciones();
    }, []);

    const abrirConfirmacion = (agrupacion) => {
        setErrorEliminacion('');
        setAgrupacionAEliminar(agrupacion);
    };

    const cerrarConfirmacion = () => {
        if (eliminando) return;
        setAgrupacionAEliminar(null);
        setErrorEliminacion('');
    };

    const confirmarEliminacion = async () => {
        if (!agrupacionAEliminar || eliminando) return;
        setEliminando(true);
        setErrorEliminacion('');
        const resultado = await eliminarAgrupacion(agrupacionAEliminar.id);
        setEliminando(false);

        if (!resultado.success) {
            setErrorEliminacion(resultado.error);
            return;
        }

        setAgrupaciones((prev) => prev.filter((agrupacion) => agrupacion.id !== agrupacionAEliminar.id));
        setAgrupacionAEliminar(null);
        setMensajeExito('Agrupación eliminada correctamente.');
    };

    return (
        <div className="space-y-5">
            <div>
                <p className="text-sm text-foreground-faint">Ajustes</p>
                <h1 className="text-2xl font-bold text-primary">Gestión de agrupaciones</h1>
                <p className="mt-1 text-sm text-foreground-soft">Administra las agrupaciones registradas y sus solicitudes asociadas.</p>
            </div>

            {mensajeExito && <div role="status" className="p-3 bg-success-soft border border-success/30 rounded-lg text-success text-sm">{mensajeExito}</div>}
            {error && <div role="alert" className="p-3 bg-danger-soft border border-danger/30 rounded-lg text-danger text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"><span>{error}</span><button type="button" onClick={cargarAgrupaciones} className="inline-flex items-center justify-center gap-2 px-3 py-1.5 border border-danger/40 rounded-lg font-medium hover:bg-danger/10 transition-colors cursor-pointer"><RefreshCw size={14} />Reintentar</button></div>}

            {loading ? (
                <div className="flex items-center justify-center gap-2 py-16 text-foreground-soft"><Loader2 className="animate-spin text-primary" size={24} />Cargando agrupaciones...</div>
            ) : agrupaciones.length === 0 ? (
                <div className="flex items-center justify-center py-16 border border-border rounded-xl bg-surface"><p className="text-sm text-foreground-faint text-center">No hay agrupaciones registradas.</p></div>
            ) : (
                <div className="bg-surface border border-border rounded-xl overflow-x-auto">
                    <table className="w-full min-w-[760px] text-sm">
                        <thead className="bg-background border-b border-border">
                            <tr className="text-left text-xs uppercase tracking-wider text-foreground-faint">
                                <th className="px-4 py-3 font-semibold">Agrupación</th>
                                <th className="px-4 py-3 font-semibold">Encargado</th>
                                <th className="px-4 py-3 font-semibold">Lugar</th>
                                <th className="px-4 py-3 font-semibold">Integrantes</th>
                                <th className="px-4 py-3 font-semibold">Solicitudes</th>
                                <th className="px-4 py-3 font-semibold text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {agrupaciones.map((agrupacion) => {
                                const solicitudes = cantidadSolicitudes(agrupacion);
                                return (
                                    <tr key={agrupacion.id} className="hover:bg-background/60 transition-colors">
                                        <td className="px-4 py-4 font-semibold text-foreground">{agrupacion.nombre || 'Sin nombre'}</td>
                                        <td className="px-4 py-4 text-foreground-soft"><span className="block">{nombreEncargado(agrupacion)}</span>{agrupacion.encargado?.cedula && <span className="text-xs text-foreground-faint">{agrupacion.encargado.cedula}</span>}</td>
                                        <td className="px-4 py-4 text-foreground-soft">{agrupacion.lugar_procedencia || '—'}</td>
                                        <td className="px-4 py-4 text-foreground-soft">{agrupacion.cantidad_integrantes ?? '—'}</td>
                                        <td className="px-4 py-4 text-foreground-soft">{textoSolicitudes(solicitudes)}</td>
                                        <td className="px-4 py-4 text-right"><button type="button" onClick={() => abrirConfirmacion(agrupacion)} aria-label={`Eliminar ${agrupacion.nombre}`} className="inline-flex items-center gap-2 px-3 py-2 border border-danger text-danger hover:bg-danger-soft rounded-lg font-medium transition-colors cursor-pointer"><Trash2 size={15} />Eliminar</button></td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            <ConfirmarEliminacion agrupacion={agrupacionAEliminar} loading={eliminando} error={errorEliminacion} onClose={cerrarConfirmacion} onConfirm={confirmarEliminacion} />
        </div>
    );
}
