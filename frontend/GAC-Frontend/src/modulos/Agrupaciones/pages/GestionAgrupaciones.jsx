import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import Aviso from '../../../components/Aviso';
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
        <div className="space-y-4">
            <BarraBusqueda
                valor={busqueda}
                onChange={setBusqueda}
                placeholder="Buscar por nombre o cédula del encargado"
                ariaLabel="Buscar agrupación"
                tamano="sm"
                className="w-full sm:max-w-xs"
            />

            <Aviso tipo="exito" mensaje={mensajeExito} />
            <Aviso mensaje={error} />

            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="animate-spin text-primary" size={28} />
                </div>
            ) : agrupaciones.length === 0 ? (
                <div className="flex items-center justify-center py-16">
                    <p className="text-sm text-foreground-faint text-center">No hay agrupaciones registradas todavía.</p>
                </div>
            ) : agrupacionesFiltradas.length === 0 ? (
                <div className="flex items-center justify-center py-16">
                    <p className="text-sm text-foreground-faint text-center">No se encontraron agrupaciones que coincidan con la búsqueda.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
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
