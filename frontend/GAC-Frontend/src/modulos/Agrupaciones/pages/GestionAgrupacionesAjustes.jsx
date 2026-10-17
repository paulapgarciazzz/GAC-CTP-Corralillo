import { useEffect, useState } from 'react';
import { Loader2, RefreshCw, Trash2 } from 'lucide-react';
import ModalConfirmarEliminacion from '../../../components/ModalConfirmarEliminacion';
import { useConfirmarEliminacion } from '../../../hooks/useConfirmarEliminacion';
import { usePermisosModulo } from '../../../auth/hooks/usePermisosModulo';
import { eliminarAgrupacion, obtenerAgrupacionesAdministrativas } from '../services/agrupacionService';

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

function DetalleEliminacion({ agrupacion }) {
    const solicitudes = cantidadSolicitudes(agrupacion);

    return (
        <div className="p-3 rounded-lg bg-background border border-border text-sm text-foreground-soft space-y-1">
            {solicitudes === 0 ? (
                <p>Esta agrupación no tiene solicitudes asociadas.</p>
            ) : (
                <>
                    <p>Esta agrupación tiene <strong className="text-foreground">{textoSolicitudes(solicitudes)}</strong> asociadas.</p>
                    <p>Al eliminarla también se eliminarán las solicitudes y registros relacionados.</p>
                </>
            )}
        </div>
    );
}

export default function GestionAgrupacionesAjustes() {
    const [agrupaciones, setAgrupaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [mensajeExito, setMensajeExito] = useState('');
    const { puedeEliminar } = usePermisosModulo('solicitudes');

    const aplicarResultado = (resultado) => {
        if (resultado.success) {
            setAgrupaciones(Array.isArray(resultado.data) ? resultado.data : []);
        } else {
            setError(resultado.error);
        }
        setLoading(false);
    };

    useEffect(() => {
        let activo = true;
        obtenerAgrupacionesAdministrativas().then((resultado) => {
            if (activo) aplicarResultado(resultado);
        });
        return () => { activo = false; };
    }, []);

    const reintentar = async () => {
        setLoading(true);
        setError('');
        aplicarResultado(await obtenerAgrupacionesAdministrativas());
    };

    const eliminacion = useConfirmarEliminacion(
        (agrupacion) => eliminarAgrupacion(agrupacion.id),
        (eliminada) => {
            setAgrupaciones((prev) => prev.filter((agrupacion) => agrupacion.id !== eliminada.id));
            setMensajeExito('Agrupación eliminada correctamente.');
        },
    );

    return (
        <div className="space-y-5">
            <div>
                <p className="text-sm text-foreground-faint">Ajustes</p>
                <h1 className="text-2xl font-bold text-primary">Gestión de agrupaciones</h1>
                <p className="mt-1 text-sm text-foreground-soft">Administra las agrupaciones registradas y sus solicitudes asociadas.</p>
            </div>

            {mensajeExito && <div role="status" className="p-3 bg-success-soft border border-success/30 rounded-lg text-success text-sm">{mensajeExito}</div>}
            {error && <div role="alert" className="p-3 bg-danger-soft border border-danger/30 rounded-lg text-danger text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"><span>{error}</span><button type="button" onClick={reintentar} className="inline-flex items-center justify-center gap-2 px-3 py-1.5 border border-danger/40 rounded-lg font-medium hover:bg-danger/10 transition-colors cursor-pointer"><RefreshCw size={14} />Reintentar</button></div>}

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
                                {puedeEliminar && <th className="px-4 py-3 font-semibold text-right">Acción</th>}
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
                                        {puedeEliminar && <td className="px-4 py-4 text-right"><button type="button" onClick={() => eliminacion.abrir(agrupacion)} aria-label={`Eliminar ${agrupacion.nombre}`} className="inline-flex items-center gap-2 px-3 py-2 border border-danger text-danger hover:bg-danger-soft rounded-lg font-medium transition-colors cursor-pointer"><Trash2 size={15} />Eliminar</button></td>}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            <ModalConfirmarEliminacion
                open={Boolean(eliminacion.elemento)}
                titulo="Eliminar agrupación"
                nombre={eliminacion.elemento && `la agrupación ${eliminacion.elemento.nombre || 'sin nombre'}`}
                advertencia={eliminacion.elemento && <DetalleEliminacion agrupacion={eliminacion.elemento} />}
                textoBoton="Eliminar agrupación"
                loading={eliminacion.eliminando}
                error={eliminacion.error}
                onClose={eliminacion.cerrar}
                onConfirm={eliminacion.confirmar}
            />
        </div>
    );
}
