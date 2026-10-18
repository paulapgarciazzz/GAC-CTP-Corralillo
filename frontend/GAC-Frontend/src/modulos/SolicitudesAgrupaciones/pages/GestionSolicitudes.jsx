import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import Aviso from '../../../components/Aviso';
import BarraBusqueda from '../../../components/BarraBusqueda';
import { obtenerSolicitudes, actualizarEstadoSolicitud, eliminarSolicitud, enviarDetallesSolicitud } from '../services/solicitudService';
import ListaSolicitudes from '../components/ListaSolicitudes';
import DetalleSolicitud from '../components/DetalleSolicitud';
import ModalEditarSolicitud from '../components/ModalEditarSolicitud';
import ModalConfirmarEliminacion from '../../../components/ModalConfirmarEliminacion';
import { useConfirmarEliminacion } from '../../../hooks/useConfirmarEliminacion';
import { usePermisosModulo } from '../../../auth/hooks/usePermisosModulo';

export default function GestionSolicitudes() {
    const { puedeEditar, puedeEliminar } = usePermisosModulo('solicitudes');
    const [solicitudes, setSolicitudes] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [solicitudEditando, setSolicitudEditando] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [mensajeExito, setMensajeExito] = useState('');
    const [busqueda, setBusqueda] = useState('');
    const [filtroEvento, setFiltroEvento] = useState('todos');

    useEffect(() => {
        (async () => {
            const result = await obtenerSolicitudes();
            if (result.success) {
                setSolicitudes(result.data);
            } else {
                setError(result.error);
            }
            setLoading(false);
        })();
    }, []);

    const cambiarEstado = async (id, nuevoEstado) => {
        const result = await actualizarEstadoSolicitud(id, nuevoEstado);
        if (result.success) {
            setSolicitudes((prev) => prev.map((s) => (s.id === id ? { ...s, estado: nuevoEstado } : s)));
        } else {
            setError(result.error);
        }
    };

    const handleEnviarDetalles = async (id) => {
        const result = await enviarDetallesSolicitud(id);
        if (result.success) {
            setMensajeExito('Los detalles de la solicitud fueron enviados al encargado.');
            setTimeout(() => setMensajeExito(''), 4000);
        } else {
            setError(result.error);
        }
    };

    const eliminacion = useConfirmarEliminacion(
        (solicitud) => eliminarSolicitud(solicitud.id),
        (solicitud) => {
            setSolicitudes((prev) => prev.filter((s) => s.id !== solicitud.id));
            setSelectedId((prev) => (prev === solicitud.id ? null : prev));
        },
    );

    const solicitudSeleccionada = solicitudes.find((s) => s.id === selectedId) ?? null;
    const eventosConSolicitudes = [
        ...new Map(solicitudes.filter((s) => s.evento).map((s) => [String(s.evento.id_evento), s.evento])).values(),
    ].sort((a, b) => a.nombre.localeCompare(b.nombre));
    const solicitudesFiltradas = solicitudes.filter((s) => {
        const coincideNombre = s.agrupacion.nombre.toLowerCase().includes(busqueda.trim().toLowerCase());
        const coincideEvento = filtroEvento === 'todos' || String(s.id_evento ?? 'ninguno') === filtroEvento;
        return coincideNombre && coincideEvento;
    });

    return (
        <div className="space-y-4">

            <div className="flex flex-col sm:flex-row gap-3">
                <BarraBusqueda
                    valor={busqueda}
                    onChange={setBusqueda}
                    placeholder="Buscar agrupación por nombre..."
                    tamano="sm"
                    className="w-full max-w-sm"
                />
                <select
                    value={filtroEvento}
                    onChange={(e) => setFiltroEvento(e.target.value)}
                    aria-label="Filtrar por evento"
                    className="w-full sm:w-64 px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    <option value="todos">Todos los eventos</option>
                    <option value="ninguno">Sin evento</option>
                    {eventosConSolicitudes.map((evento) => (
                        <option key={evento.id_evento} value={String(evento.id_evento)}>{evento.nombre}</option>
                    ))}
                </select>
            </div>

            <Aviso mensaje={error} />
            <Aviso tipo="exito" mensaje={mensajeExito} />

            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="animate-spin text-primary" size={28} />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-4 h-[calc(100vh-8rem)]">
                    <div className={`bg-surface border border-border rounded-xl  overflow-y-auto ${selectedId ? 'hidden lg:block' : 'block'}`}>
                        <ListaSolicitudes
                            solicitudes={solicitudesFiltradas}
                            selectedId={selectedId}
                            onSelect={setSelectedId}
                            onAceptar={puedeEditar ? (id) => cambiarEstado(id, 'aprobada') : undefined}
                            onRechazar={puedeEditar ? (id) => cambiarEstado(id, 'rechazada') : undefined}
                            onEditar={puedeEditar ? setSolicitudEditando : undefined}
                            onEnviarDetalles={puedeEditar ? handleEnviarDetalles : undefined}
                            onEliminar={puedeEliminar ? eliminacion.abrir : undefined}
                            hayBusqueda={busqueda.trim().length > 0 || filtroEvento !== 'todos'}
                        />
                    </div>

                    <div className={`bg-surface border border-border rounded-xl  overflow-y-auto ${selectedId ? 'block' : 'hidden lg:block'}`}>
                        <DetalleSolicitud solicitud={solicitudSeleccionada} onBack={() => setSelectedId(null)} />
                    </div>
                </div>
            )}

            <ModalEditarSolicitud
                open={!!solicitudEditando}
                solicitud={solicitudEditando}
                onClose={() => setSolicitudEditando(null)}
                onActualizado={(actualizada) => {
                    setSolicitudes((prev) => prev.map((s) => (s.id === actualizada.id ? actualizada : s)));
                }}
            />
            <ModalConfirmarEliminacion
                open={Boolean(eliminacion.elemento)}
                titulo="Eliminar solicitud"
                nombre={eliminacion.elemento && `la solicitud de ${eliminacion.elemento.agrupacion.nombre}`}
                textoBoton="Eliminar solicitud"
                loading={eliminacion.eliminando}
                error={eliminacion.error}
                onClose={eliminacion.cerrar}
                onConfirm={eliminacion.confirmar}
            />
        </div>
    );
}
