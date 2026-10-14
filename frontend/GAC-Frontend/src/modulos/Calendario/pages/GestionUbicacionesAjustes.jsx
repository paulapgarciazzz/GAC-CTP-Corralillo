import { useEffect, useState } from 'react';
import { Loader2, Plus, RefreshCw } from 'lucide-react';
import ModalConfirmarEliminacion from '../components/ModalConfirmarEliminacion';
import ModalUbicacion from '../components/ModalUbicacion';
import TarjetaUbicacion from '../components/TarjetaUbicacion';
import { useConfirmarEliminacion } from '../hooks/useConfirmarEliminacion';
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
                    <p className="text-sm text-foreground-faint">Ajustes</p>
                    <h1 className="text-2xl font-bold text-primary">Gestión de ubicaciones</h1>
                    <p className="mt-1 text-sm text-foreground-soft">Administra los lugares donde se realizan las actividades de los eventos.</p>
                </div>
                <button type="button" onClick={abrirCrear} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold transition-colors cursor-pointer">
                    <Plus size={18} />Agregar ubicación
                </button>
            </div>

            {mensajeExito && <div role="status" className="p-3 bg-success-soft border border-success/30 rounded-lg text-success text-sm">{mensajeExito}</div>}
            {error && <div role="alert" className="p-3 bg-danger-soft border border-danger/30 rounded-lg text-danger text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"><span>{error}</span><button type="button" onClick={cargarUbicaciones} className="inline-flex items-center justify-center gap-2 px-3 py-1.5 border border-danger/40 rounded-lg font-medium hover:bg-danger/10 transition-colors cursor-pointer"><RefreshCw size={14} />Reintentar</button></div>}

            {loading ? (
                <div className="flex items-center justify-center gap-2 py-16 text-foreground-soft"><Loader2 className="animate-spin text-primary" size={24} />Cargando ubicaciones...</div>
            ) : ubicaciones.length === 0 ? (
                !error && <div className="flex items-center justify-center py-16 border border-border rounded-xl bg-surface"><p className="text-sm text-foreground-faint text-center">No hay ubicaciones registradas.</p></div>
            ) : (
                // 1 columna en celulares angostos; desde 400px ya caben 2 tarjetas sin que se salgan los botones.
                <div className="grid grid-cols-1 min-[400px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {ubicaciones.map((ubicacion) => (
                        <TarjetaUbicacion key={ubicacion.id_ubicacion} ubicacion={ubicacion} onEditar={abrirEditar} onEliminar={eliminacion.abrir} />
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
