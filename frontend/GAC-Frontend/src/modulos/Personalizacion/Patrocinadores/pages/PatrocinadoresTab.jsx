import { useEffect, useState } from 'react';
import { Loader2, Plus, RefreshCw } from 'lucide-react';
import {
    DndContext,
    KeyboardSensor,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    SortableContext,
    arrayMove,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import ModalConfirmarEliminacionPatrocinador from '../components/ModalConfirmarEliminacionPatrocinador';
import ModalPatrocinador from '../components/ModalPatrocinador';
import TarjetaPatrocinador from '../components/TarjetaPatrocinador';
import ConfiguracionSeccion from '../components/ConfiguracionSeccion';
import { useConfirmarEliminacion } from '../hooks/useConfirmarEliminacion';
import {
    actualizarPatrocinador,
    crearPatrocinador,
    eliminarPatrocinador,
    obtenerPatrocinadores,
    reordenarPatrocinadores,
} from '../services/patrocinadorService';

const ordenarPorOrden = (lista) => [...lista].sort((a, b) => a.orden - b.orden);

export default function PatrocinadoresTab() {
    const [patrocinadores, setPatrocinadores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [mensajeExito, setMensajeExito] = useState('');
    const [guardandoOrden, setGuardandoOrden] = useState(false);
    const [modal, setModal] = useState({ abierto: false, patrocinador: null });

    const sensores = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const mostrarExito = (mensaje) => {
        setMensajeExito(mensaje);
        window.setTimeout(() => setMensajeExito(''), 3500);
    };

    const eliminacion = useConfirmarEliminacion(
        (patrocinador) => eliminarPatrocinador(patrocinador.id_patrocinador),
        (patrocinador) => {
            setPatrocinadores((prev) => prev.filter((item) => item.id_patrocinador !== patrocinador.id_patrocinador));
            mostrarExito('Patrocinador eliminado correctamente.');
        },
    );

    const cargarPatrocinadores = async () => {
        setLoading(true);
        setError('');
        const resultado = await obtenerPatrocinadores();
        if (resultado.success) setPatrocinadores(ordenarPorOrden(resultado.data));
        else setError(resultado.error);
        setLoading(false);
    };

    useEffect(() => {
        let activo = true;

        obtenerPatrocinadores().then((resultado) => {
            if (!activo) return;
            if (resultado.success) setPatrocinadores(ordenarPorOrden(resultado.data));
            else setError(resultado.error);
            setLoading(false);
        });

        return () => {
            activo = false;
        };
    }, []);

    const abrirCrear = () => setModal({ abierto: true, patrocinador: null });
    const abrirEditar = (patrocinador) => setModal({ abierto: true, patrocinador });
    const cerrarModal = () => setModal({ abierto: false, patrocinador: null });

    const guardarPatrocinador = async (datos) => {
        const editando = modal.patrocinador;
        const resultado = editando
            ? await actualizarPatrocinador(editando.id_patrocinador, datos)
            : await crearPatrocinador(datos);

        if (resultado.success) {
            setPatrocinadores((prev) => ordenarPorOrden(editando
                ? prev.map((item) => (item.id_patrocinador === resultado.data.id_patrocinador ? resultado.data : item))
                : [...prev, resultado.data]));
            cerrarModal();
            mostrarExito(editando ? 'Patrocinador actualizado correctamente.' : 'Patrocinador agregado correctamente.');
        }

        return resultado;
    };

    const alternarActivo = async (patrocinador) => {
        const resultado = await actualizarPatrocinador(patrocinador.id_patrocinador, { activo: !patrocinador.activo });
        if (resultado.success) {
            setPatrocinadores((prev) => ordenarPorOrden(
                prev.map((item) => (item.id_patrocinador === resultado.data.id_patrocinador ? resultado.data : item)),
            ));
        } else {
            setError(resultado.error);
        }
    };

    const alTerminarArrastre = async (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const indiceAnterior = patrocinadores.findIndex((item) => item.id_patrocinador === active.id);
        const indiceNuevo = patrocinadores.findIndex((item) => item.id_patrocinador === over.id);
        const reordenados = arrayMove(patrocinadores, indiceAnterior, indiceNuevo)
            .map((item, indice) => ({ ...item, orden: indice }));

        setPatrocinadores(reordenados);
        setGuardandoOrden(true);
        setError('');

        const resultado = await reordenarPatrocinadores(
            reordenados.map((item) => ({ id_patrocinador: item.id_patrocinador, orden: item.orden })),
        );
        setGuardandoOrden(false);

        if (!resultado.success) setError(resultado.error);
    };

    return (
        <div className="space-y-8">
            <section>
                <h2 className="text-lg font-bold text-foreground mb-3">Título y descripción de la sección</h2>
                <ConfiguracionSeccion />
            </section>

            <section className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-foreground">Patrocinadores</h2>
                        <p className="mt-1 text-sm text-foreground-soft">
                            Arrastra para cambiar el orden de aparición en la landing.
                            {guardandoOrden && ' Guardando orden...'}
                        </p>
                    </div>
                    <button type="button" onClick={abrirCrear} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold transition-colors cursor-pointer">
                        <Plus size={18} />Agregar patrocinador
                    </button>
                </div>

                {mensajeExito && <div role="status" className="p-3 bg-success-soft border border-success/30 rounded-lg text-success text-sm">{mensajeExito}</div>}
                {error && (
                    <div role="alert" className="p-3 bg-danger-soft border border-danger/30 rounded-lg text-danger text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <span>{error}</span>
                        <button type="button" onClick={cargarPatrocinadores} className="inline-flex items-center justify-center gap-2 px-3 py-1.5 border border-danger/40 rounded-lg font-medium hover:bg-danger/10 transition-colors cursor-pointer">
                            <RefreshCw size={14} />Reintentar
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center gap-2 py-16 text-foreground-soft">
                        <Loader2 className="animate-spin text-primary" size={24} />Cargando patrocinadores...
                    </div>
                ) : patrocinadores.length === 0 ? (
                    !error && (
                        <div className="flex items-center justify-center py-16 border border-border rounded-xl bg-surface">
                            <p className="text-sm text-foreground-faint text-center">No hay patrocinadores registrados.</p>
                        </div>
                    )
                ) : (
                    <DndContext sensors={sensores} collisionDetection={closestCenter} onDragEnd={alTerminarArrastre}>
                        <SortableContext items={patrocinadores.map((item) => item.id_patrocinador)} strategy={verticalListSortingStrategy}>
                            <div className="space-y-2">
                                {patrocinadores.map((patrocinador) => (
                                    <TarjetaPatrocinador
                                        key={patrocinador.id_patrocinador}
                                        patrocinador={patrocinador}
                                        onEditar={abrirEditar}
                                        onEliminar={eliminacion.abrir}
                                        onToggleActivo={alternarActivo}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                )}
            </section>

            <ModalPatrocinador
                open={modal.abierto}
                patrocinador={modal.patrocinador}
                onClose={cerrarModal}
                onGuardar={guardarPatrocinador}
            />
            <ModalConfirmarEliminacionPatrocinador
                patrocinador={eliminacion.elemento}
                loading={eliminacion.eliminando}
                error={eliminacion.error}
                onClose={eliminacion.cerrar}
                onConfirm={eliminacion.confirmar}
            />
        </div>
    );
}
