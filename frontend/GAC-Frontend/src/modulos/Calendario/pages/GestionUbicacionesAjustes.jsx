import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import ModalConfirmarEliminacion from '../../../components/ModalConfirmarEliminacion';
import Aviso from '../../../components/Aviso';
import { EsqueletoLista, EstadoVacio } from '../../../components/EstadoLista';
import { useConfirmarEliminacion } from '../../../hooks/useConfirmarEliminacion';
import { usePermisosModulo } from '../../../auth/hooks/usePermisosModulo';
import ModalUbicacion from '../components/ModalUbicacion';
import TarjetaUbicacion from '../components/TarjetaUbicacion';
import {
    actualizarUbicacion,
    crearUbicacion,
    eliminarUbicacion,
    obtenerUbicaciones,
} from '../services/ubicacionService';

const ordenarPorNombre = (lista) => [...lista].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));

export default function GestionUbicacionesAjustes() {
    const [ubicaciones, setUbicaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [mensajeExito, setMensajeExito] = useState('');
    const [modal, setModal] = useState({ abierto: false, ubicacion: null });
    const { puedeCrear, puedeEditar, puedeEliminar } = usePermisosModulo('calendario');

    const mostrarExito = (mensaje) => {
        setMensajeExito(mensaje);
        window.setTimeout(() => setMensajeExito(''), 3500);
    };

    const eliminacion = useConfirmarEliminacion(
        (ubicacion) => eliminarUbicacion(ubicacion.id_ubicacion),
        (ubicacion) => {
            setUbicaciones((prev) => prev.filter((item) => item.id_ubicacion !== ubicacion.id_ubicacion));
            mostrarExito('Ubicación eliminada correctamente.');
        },
    );

    const cargarUbicaciones = async () => {
        setLoading(true);
        setError('');
        const resultado = await obtenerUbicaciones();
        if (resultado.success) setUbicaciones(resultado.data);
        else setError(resultado.error);
        setLoading(false);
    };

    useEffect(() => {
        let activo = true;

        obtenerUbicaciones().then((resultado) => {
            if (!activo) return;
            if (resultado.success) setUbicaciones(resultado.data);
            else setError(resultado.error);
            setLoading(false);
        });

        return () => {
            activo = false;
        };
    }, []);

    const abrirCrear = () => setModal({ abierto: true, ubicacion: null });
    const abrirEditar = (ubicacion) => setModal({ abierto: true, ubicacion });
    const cerrarModal = () => setModal({ abierto: false, ubicacion: null });

    const guardarUbicacion = async (datos) => {
        const editando = modal.ubicacion;
        const resultado = editando
            ? await actualizarUbicacion(editando.id_ubicacion, datos)
            : await crearUbicacion(datos);

        if (resultado.success) {
            setUbicaciones((prev) => ordenarPorNombre(editando
                ? prev.map((item) => (item.id_ubicacion === resultado.data.id_ubicacion ? resultado.data : item))
                : [...prev, resultado.data]));
            cerrarModal();
            mostrarExito(editando ? 'Ubicación actualizada correctamente.' : 'Ubicación agregada correctamente.');
        }

        return resultado;
    };

    return (
        <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                    
                    <h1 className="text-2xl font-semibold text-foreground">Gestión de ubicaciones</h1>
                    <p className="mt-1 text-sm text-foreground-soft">Administra los lugares donde se realizan las actividades de los eventos.</p>
                </div>
                {puedeCrear && (
                    <button type="button" onClick={abrirCrear} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-on-primary rounded-lg font-semibold transition-colors cursor-pointer">
                        <Plus size={18} />Agregar ubicación
                    </button>
                )}
            </div>

            <Aviso tipo="exito" mensaje={mensajeExito} />
            <Aviso mensaje={error} onReintentar={cargarUbicaciones} />

            {loading ? (
                <EsqueletoLista texto="Cargando ubicaciones..." />
            ) : ubicaciones.length === 0 ? (
                !error && <EstadoVacio mensaje="No hay ubicaciones registradas." />
            ) : (
                // 1 columna en celulares angostos; desde 400px ya caben 2 tarjetas sin que se salgan los botones.
                <div className="grid grid-cols-1 min-[400px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {ubicaciones.map((ubicacion) => (
                        <TarjetaUbicacion key={ubicacion.id_ubicacion} ubicacion={ubicacion} onEditar={puedeEditar ? abrirEditar : undefined} onEliminar={puedeEliminar ? eliminacion.abrir : undefined} />
                    ))}
                </div>
            )}

            <ModalUbicacion
                open={modal.abierto}
                ubicacion={modal.ubicacion}
                onClose={cerrarModal}
                onGuardar={guardarUbicacion}
            />
            <ModalConfirmarEliminacion
                open={Boolean(eliminacion.elemento)}
                titulo="Eliminar ubicación"
                nombre={eliminacion.elemento?.nombre}
                advertencia="Las actividades programadas en esta ubicación quedarán sin ubicación."
                textoBoton="Eliminar ubicación"
                loading={eliminacion.eliminando}
                error={eliminacion.error}
                onClose={eliminacion.cerrar}
                onConfirm={eliminacion.confirmar}
            />
        </div>
    );
}
