import { useEffect, useState } from 'react';
import { AlertTriangle, Loader2, RefreshCw, Trash2, X } from 'lucide-react';
import { eliminarEncargado, obtenerEncargados } from '../services/encargadoService';
import { obtenerConfigIdentificacion } from '../../../utils/identificacion';

function cantidad(valor) {
    return Number(valor ?? 0);
}

function textoCantidad(valor, singular, plural) {
    const numero = cantidad(valor);
    return `${numero} ${numero === 1 ? singular : plural}`;
}

function nombreEncargado(encargado) {
    return [encargado.primer_nombre, encargado.apellido].filter(Boolean).join(' ') || 'Sin nombre';
}

function ConfirmarEliminacion({ encargado, loading, error, onClose, onConfirm }) {
    if (!encargado) return null;

    const agrupaciones = cantidad(encargado.agrupaciones_count);
    const solicitudes = cantidad(encargado.solicitudes_count);
    const tieneDatosAsociados = agrupaciones > 0 || solicitudes > 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={loading ? undefined : onClose}>
            <div role="dialog" aria-modal="true" aria-labelledby="titulo-confirmar-eliminacion-encargado" onClick={(event) => event.stopPropagation()} className="w-full max-w-md bg-surface rounded-2xl shadow-2xl p-6 relative">
                <button type="button" onClick={onClose} disabled={loading} aria-label="Cerrar" className="absolute top-4 right-4 text-foreground-faint hover:text-foreground disabled:opacity-50 transition-colors cursor-pointer"><X size={20} /></button>
                <div className="flex items-start gap-3 pr-8">
                    <div className="p-2 rounded-full bg-danger-soft text-danger shrink-0"><AlertTriangle size={20} /></div>
                    <div>
                        <h2 id="titulo-confirmar-eliminacion-encargado" className="text-lg font-bold text-foreground">Eliminar encargado</h2>
                        <p className="mt-3 text-sm text-foreground-soft">¿Seguro que deseas eliminar a <strong className="text-foreground">{nombreEncargado(encargado)}</strong>?</p>
                    </div>
                </div>
                <div className="mt-4 p-3 rounded-lg bg-background border border-border text-sm text-foreground-soft space-y-1">
                    {!tieneDatosAsociados ? (
                        <p>Este encargado no tiene agrupaciones ni solicitudes asociadas.</p>
                    ) : (
                        <>
                            <p>Este encargado tiene <strong className="text-foreground">{textoCantidad(agrupaciones, 'agrupación', 'agrupaciones')}</strong> y <strong className="text-foreground">{textoCantidad(solicitudes, 'solicitud', 'solicitudes')}</strong> asociadas.</p>
                            <p>Al eliminarlo también se eliminarán sus agrupaciones y registros relacionados.</p>
                            <p className="font-medium text-danger">Esta acción no se puede deshacer.</p>
                        </>
                    )}
                </div>
                {error && <div role="alert" className="mt-4 p-3 bg-danger-soft border border-danger/30 rounded-lg text-danger text-sm">{error}</div>}
                <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                    <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 border border-border text-foreground-soft hover:bg-background disabled:opacity-50 rounded-lg font-medium transition-colors cursor-pointer">Cancelar</button>
                    <button type="button" onClick={onConfirm} disabled={loading} className="px-4 py-2 bg-danger hover:bg-danger/90 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors cursor-pointer flex items-center justify-center gap-2">{loading && <Loader2 size={16} className="animate-spin" />}{loading ? 'Eliminando...' : 'Eliminar encargado'}</button>
                </div>
            </div>
        </div>
    );
}

export default function GestionEncargadosAjustes() {
    const [encargados, setEncargados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [mensajeExito, setMensajeExito] = useState('');
    const [encargadoAEliminar, setEncargadoAEliminar] = useState(null);
    const [eliminando, setEliminando] = useState(false);
    const [errorEliminacion, setErrorEliminacion] = useState('');

    const cargarEncargados = async () => {
        setLoading(true);
        setError('');
        const resultado = await obtenerEncargados();
        if (resultado.success) setEncargados(Array.isArray(resultado.data) ? resultado.data : []);
        else setError(resultado.error);
        setLoading(false);
    };

    useEffect(() => {
        cargarEncargados();
    }, []);

    const abrirConfirmacion = (encargado) => {
        setErrorEliminacion('');
        setEncargadoAEliminar(encargado);
    };

    const cerrarConfirmacion = () => {
        if (eliminando) return;
        setEncargadoAEliminar(null);
        setErrorEliminacion('');
    };

    const confirmarEliminacion = async () => {
        if (!encargadoAEliminar || eliminando) return;
        setEliminando(true);
        setErrorEliminacion('');
        const resultado = await eliminarEncargado(encargadoAEliminar.cedula);
        setEliminando(false);
        if (!resultado.success) {
            setErrorEliminacion(resultado.error);
            return;
        }
        setEncargados((prev) => prev.filter((encargado) => encargado.cedula !== encargadoAEliminar.cedula));
        setEncargadoAEliminar(null);
        setMensajeExito('Encargado eliminado correctamente.');
    };

    return (
        <div className="space-y-5">
            <div>
                <p className="text-sm text-foreground-faint">Ajustes</p>
                <h1 className="text-2xl font-bold text-primary">Gestión de encargados</h1>
                <p className="mt-1 text-sm text-foreground-soft">Administra los encargados registrados y sus datos asociados.</p>
            </div>
            {mensajeExito && <div role="status" className="p-3 bg-success-soft border border-success/30 rounded-lg text-success text-sm">{mensajeExito}</div>}
            {error && <div role="alert" className="p-3 bg-danger-soft border border-danger/30 rounded-lg text-danger text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"><span>{error}</span><button type="button" onClick={cargarEncargados} className="inline-flex items-center justify-center gap-2 px-3 py-1.5 border border-danger/40 rounded-lg font-medium hover:bg-danger/10 transition-colors cursor-pointer"><RefreshCw size={14} />Reintentar</button></div>}
            {loading ? (
                <div className="flex items-center justify-center gap-2 py-16 text-foreground-soft"><Loader2 className="animate-spin text-primary" size={24} />Cargando encargados...</div>
            ) : encargados.length === 0 ? (
                <div className="flex items-center justify-center py-16 border border-border rounded-xl bg-surface"><p className="text-sm text-foreground-faint text-center">No hay encargados registrados.</p></div>
            ) : (
                <div className="bg-surface border border-border rounded-xl overflow-x-auto">
                    <table className="w-full min-w-[980px] text-sm">
                        <thead className="bg-background border-b border-border"><tr className="text-left text-xs uppercase tracking-wider text-foreground-faint"><th className="px-4 py-3 font-semibold">Encargado</th><th className="px-4 py-3 font-semibold">Identificación</th><th className="px-4 py-3 font-semibold">Contacto</th><th className="px-4 py-3 font-semibold">Agrupaciones</th><th className="px-4 py-3 font-semibold">Solicitudes</th><th className="px-4 py-3 font-semibold text-right">Acción</th></tr></thead>
                        <tbody className="divide-y divide-border">{encargados.map((encargado) => <tr key={encargado.cedula} className="hover:bg-background/60 transition-colors"><td className="px-4 py-4 font-semibold text-foreground">{nombreEncargado(encargado)}</td><td className="px-4 py-4 text-foreground-soft"><span className="block">{obtenerConfigIdentificacion(encargado.tipo_identificacion).etiquetaCorta}</span><span className="text-xs text-foreground-faint">{encargado.cedula}</span></td><td className="px-4 py-4 text-foreground-soft"><span className="block">{encargado.email || '—'}</span><span className="text-xs text-foreground-faint">{encargado.numero_tel || '—'}</span></td><td className="px-4 py-4 text-foreground-soft">{textoCantidad(encargado.agrupaciones_count, 'agrupación', 'agrupaciones')}</td><td className="px-4 py-4 text-foreground-soft">{textoCantidad(encargado.solicitudes_count, 'solicitud', 'solicitudes')}</td><td className="px-4 py-4 text-right"><button type="button" onClick={() => abrirConfirmacion(encargado)} aria-label={`Eliminar a ${nombreEncargado(encargado)}`} className="inline-flex items-center gap-2 px-3 py-2 border border-danger text-danger hover:bg-danger-soft rounded-lg font-medium transition-colors cursor-pointer"><Trash2 size={15} />Eliminar</button></td></tr>)}</tbody>
                    </table>
                </div>
            )}
            <ConfirmarEliminacion encargado={encargadoAEliminar} loading={eliminando} error={errorEliminacion} onClose={cerrarConfirmacion} onConfirm={confirmarEliminacion} />
        </div>
    );
}
