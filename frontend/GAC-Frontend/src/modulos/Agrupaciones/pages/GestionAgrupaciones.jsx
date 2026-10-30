import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import Aviso from '../../../components/Aviso';
import { EstadoVacio } from '../../../components/EstadoLista';
import BarraBusqueda from '../../../components/BarraBusqueda';
import ModalConfirmarEliminacion from '../../../components/ModalConfirmarEliminacion';
import { useConfirmarEliminacion } from '../../../hooks/useConfirmarEliminacion';
import { eliminarAgrupacion, obtenerAgrupacionesAprobadas } from '../services/agrupacionService';
import TarjetaAgrupacion from '../components/TarjetaAgrupacion';
import ModalEditarAgrupacion from '../components/ModalEditarAgrupacion';
import ModalDetalleAgrupacion from '../components/ModalDetalleAgrupacion';
import DetalleEliminacionAgrupacion from '../components/DetalleEliminacionAgrupacion';
import { usePermisosModulo } from '../../../auth/hooks/usePermisosModulo';

export default function GestionAgrupaciones() {
    const { puedeEditar, puedeEliminar } = usePermisosModulo('solicitudes');
    const [agrupaciones, setAgrupaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [mensajeExito, setMensajeExito] = useState('');
    const [agrupacionDetalle, setAgrupacionDetalle] = useState(null);
    const [agrupacionEditar, setAgrupacionEditar] = useState(null);
    const [busqueda, setBusqueda] = useState('');

    useEffect(() => {
        (async () => {
            const result = await obtenerAgrupacionesAprobadas();
            if (result.success) {
                setAgrupaciones(result.data);
            } else {
                setError(result.error);
            }
            setLoading(false);
        })();
    }, []);

    const handleActualizado = (agrupacionActualizada) => {
        setAgrupaciones((prev) => prev.map((a) => (a.id === agrupacionActualizada.id ? agrupacionActualizada : a)));
    };

    const eliminacion = useConfirmarEliminacion(
        (agrupacion) => eliminarAgrupacion(agrupacion.id),
        (eliminada) => {
            setAgrupaciones((prev) => prev.filter((a) => a.id !== eliminada.id));
            setMensajeExito('Agrupación eliminada correctamente.');
        },
    );

    const terminoBusqueda = busqueda.trim().toLowerCase();
    const agrupacionesFiltradas = terminoBusqueda
        ? agrupaciones.filter((agrupacion) =>
            agrupacion.nombre?.toLowerCase().includes(terminoBusqueda)
            || agrupacion.encargado?.cedula?.toLowerCase().includes(terminoBusqueda)
        )
        : agrupaciones;

    return (
        <div className="space-y-5">
            <div>
                <p className="text-sm text-foreground-faint">Solicitudes</p>
                <h1 className="text-2xl font-semibold text-foreground">Gestión de agrupaciones</h1>
                <p className="mt-1 text-sm text-foreground-soft">Consulta, edita o elimina las agrupaciones registradas. Selecciona una tarjeta para ver su detalle.</p>
            </div>

            <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
                <BarraBusqueda
                    valor={busqueda}
                    onChange={setBusqueda}
                    placeholder="Buscar por nombre o cédula del encargado"
                    ariaLabel="Buscar agrupación"
                    tamano="sm"
                    className="w-full sm:max-w-sm"
                />
                {!loading && agrupaciones.length > 0 && (
                    <p role="status" className="inline-flex items-center gap-2 text-sm text-foreground-soft">
                        <Users size={16} className="text-primary" aria-hidden="true" />
                        {terminoBusqueda
                            ? `${agrupacionesFiltradas.length} de ${agrupaciones.length} agrupaciones`
                            : `${agrupaciones.length} ${agrupaciones.length === 1 ? 'agrupación' : 'agrupaciones'}`}
                    </p>
                )}
            </div>

            <Aviso tipo="exito" mensaje={mensajeExito} />
            <Aviso mensaje={error} />

            {loading ? (
                <div role="status" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <span className="sr-only">Cargando agrupaciones...</span>
                    {Array.from({ length: 4 }, (_, i) => (
                        <div key={i} aria-hidden="true" className="overflow-hidden rounded-xl border border-border bg-surface">
                            <div className="esqueleto aspect-4/3 rounded-none" />
                            <div className="space-y-2.5 p-4">
                                <span className="esqueleto block h-4 w-2/3" />
                                <span className="esqueleto block h-3 w-1/2" />
                                <span className="esqueleto block h-3 w-1/3" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : agrupaciones.length === 0 ? (
                <EstadoVacio mensaje="No hay agrupaciones registradas todavía." />
            ) : agrupacionesFiltradas.length === 0 ? (
                <EstadoVacio mensaje="No se encontraron agrupaciones que coincidan con la búsqueda." />
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {agrupacionesFiltradas.map((agrupacion) => (
                        <TarjetaAgrupacion
                            key={agrupacion.id}
                            agrupacion={agrupacion}
                            onVerDetalle={setAgrupacionDetalle}
                            onEditar={puedeEditar ? setAgrupacionEditar : undefined}
                            onEliminar={puedeEliminar ? eliminacion.abrir : undefined}
                        />
                    ))}
                </div>
            )}

            <ModalDetalleAgrupacion
                open={!!agrupacionDetalle}
                agrupacion={agrupacionDetalle}
                onClose={() => setAgrupacionDetalle(null)}
            />

            <ModalEditarAgrupacion
                open={!!agrupacionEditar}
                agrupacion={agrupacionEditar}
                onClose={() => setAgrupacionEditar(null)}
                onActualizado={handleActualizado}
            />

            <ModalConfirmarEliminacion
                open={Boolean(eliminacion.elemento)}
                titulo="Eliminar agrupación"
                nombre={eliminacion.elemento && `la agrupación ${eliminacion.elemento.nombre || 'sin nombre'}`}
                advertencia={eliminacion.elemento && <DetalleEliminacionAgrupacion agrupacion={eliminacion.elemento} />}
                textoBoton="Eliminar agrupación"
                loading={eliminacion.eliminando}
                error={eliminacion.error}
                onClose={eliminacion.cerrar}
                onConfirm={eliminacion.confirmar}
            />
        </div>
    );
}
