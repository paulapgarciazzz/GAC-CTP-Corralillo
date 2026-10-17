import { useEffect, useState } from 'react';
import { Loader2, RefreshCw, Trash2 } from 'lucide-react';
import ModalConfirmarEliminacion from '../../../components/ModalConfirmarEliminacion';
import { useConfirmarEliminacion } from '../../../hooks/useConfirmarEliminacion';
import { usePermisosModulo } from '../../../auth/hooks/usePermisosModulo';
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

function DetalleEliminacion({ encargado }) {
    const agrupaciones = cantidad(encargado.agrupaciones_count);
    const solicitudes = cantidad(encargado.solicitudes_count);

    return (
        <div className="p-3 rounded-lg bg-background border border-border text-sm text-foreground-soft space-y-1">
            {agrupaciones === 0 && solicitudes === 0 ? (
                <p>Este encargado no tiene agrupaciones ni solicitudes asociadas.</p>
            ) : (
                <>
                    <p>Este encargado tiene <strong className="text-foreground">{textoCantidad(agrupaciones, 'agrupación', 'agrupaciones')}</strong> y <strong className="text-foreground">{textoCantidad(solicitudes, 'solicitud', 'solicitudes')}</strong> asociadas.</p>
                    <p>Al eliminarlo también se eliminarán sus agrupaciones y registros relacionados.</p>
                </>
            )}
        </div>
    );
}

export default function GestionEncargadosAjustes() {
    const [encargados, setEncargados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [mensajeExito, setMensajeExito] = useState('');
    const { puedeEliminar } = usePermisosModulo('solicitudes');

    const aplicarResultado = (resultado) => {
        if (resultado.success) setEncargados(Array.isArray(resultado.data) ? resultado.data : []);
        else setError(resultado.error);
        setLoading(false);
    };

    useEffect(() => {
        let activo = true;
        obtenerEncargados().then((resultado) => {
            if (activo) aplicarResultado(resultado);
        });
        return () => { activo = false; };
    }, []);

    const reintentar = async () => {
        setLoading(true);
        setError('');
        aplicarResultado(await obtenerEncargados());
    };

    const eliminacion = useConfirmarEliminacion(
        (encargado) => eliminarEncargado(encargado.cedula),
        (eliminado) => {
            setEncargados((prev) => prev.filter((encargado) => encargado.cedula !== eliminado.cedula));
            setMensajeExito('Encargado eliminado correctamente.');
        },
    );

    return (
        <div className="space-y-5">
            <div>
                <p className="text-sm text-foreground-faint">Ajustes</p>
                <h1 className="text-2xl font-bold text-primary">Gestión de encargados</h1>
                <p className="mt-1 text-sm text-foreground-soft">Administra los encargados registrados y sus datos asociados.</p>
            </div>
            {mensajeExito && <div role="status" className="p-3 bg-success-soft border border-success/30 rounded-lg text-success text-sm">{mensajeExito}</div>}
            {error && <div role="alert" className="p-3 bg-danger-soft border border-danger/30 rounded-lg text-danger text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"><span>{error}</span><button type="button" onClick={reintentar} className="inline-flex items-center justify-center gap-2 px-3 py-1.5 border border-danger/40 rounded-lg font-medium hover:bg-danger/10 transition-colors cursor-pointer"><RefreshCw size={14} />Reintentar</button></div>}
            {loading ? (
                <div className="flex items-center justify-center gap-2 py-16 text-foreground-soft"><Loader2 className="animate-spin text-primary" size={24} />Cargando encargados...</div>
            ) : encargados.length === 0 ? (
                <div className="flex items-center justify-center py-16 border border-border rounded-xl bg-surface"><p className="text-sm text-foreground-faint text-center">No hay encargados registrados.</p></div>
            ) : (
                <div className="bg-surface border border-border rounded-xl overflow-x-auto">
                    <table className="w-full min-w-[980px] text-sm">
                        <thead className="bg-background border-b border-border"><tr className="text-left text-xs uppercase tracking-wider text-foreground-faint"><th className="px-4 py-3 font-semibold">Encargado</th><th className="px-4 py-3 font-semibold">Identificación</th><th className="px-4 py-3 font-semibold">Contacto</th><th className="px-4 py-3 font-semibold">Agrupaciones</th><th className="px-4 py-3 font-semibold">Solicitudes</th>{puedeEliminar && <th className="px-4 py-3 font-semibold text-right">Acción</th>}</tr></thead>
                        <tbody className="divide-y divide-border">{encargados.map((encargado) => <tr key={encargado.cedula} className="hover:bg-background/60 transition-colors"><td className="px-4 py-4 font-semibold text-foreground">{nombreEncargado(encargado)}</td><td className="px-4 py-4 text-foreground-soft"><span className="block">{obtenerConfigIdentificacion(encargado.tipo_identificacion).etiquetaCorta}</span><span className="text-xs text-foreground-faint">{encargado.cedula}</span></td><td className="px-4 py-4 text-foreground-soft"><span className="block">{encargado.email || '—'}</span><span className="text-xs text-foreground-faint">{encargado.numero_tel || '—'}</span></td><td className="px-4 py-4 text-foreground-soft">{textoCantidad(encargado.agrupaciones_count, 'agrupación', 'agrupaciones')}</td><td className="px-4 py-4 text-foreground-soft">{textoCantidad(encargado.solicitudes_count, 'solicitud', 'solicitudes')}</td>{puedeEliminar && <td className="px-4 py-4 text-right"><button type="button" onClick={() => eliminacion.abrir(encargado)} aria-label={`Eliminar a ${nombreEncargado(encargado)}`} className="inline-flex items-center gap-2 px-3 py-2 border border-danger text-danger hover:bg-danger-soft rounded-lg font-medium transition-colors cursor-pointer"><Trash2 size={15} />Eliminar</button></td>}</tr>)}</tbody>
                    </table>
                </div>
            )}
            <ModalConfirmarEliminacion
                open={Boolean(eliminacion.elemento)}
                titulo="Eliminar encargado"
                nombre={eliminacion.elemento && nombreEncargado(eliminacion.elemento)}
                advertencia={eliminacion.elemento && <DetalleEliminacion encargado={eliminacion.elemento} />}
                textoBoton="Eliminar encargado"
                loading={eliminacion.eliminando}
                error={eliminacion.error}
                onClose={eliminacion.cerrar}
                onConfirm={eliminacion.confirmar}
            />
        </div>
    );
}
