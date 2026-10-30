import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
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
import ModalConfirmarEliminacion from '../../../../components/ModalConfirmarEliminacion';
import Aviso from '../../../../components/Aviso';
import { EsqueletoLista, EstadoVacio } from '../../../../components/EstadoLista';
import { useConfirmarEliminacion } from '../../../../hooks/useConfirmarEliminacion';
import { usePermisosModulo } from '../../../../auth/hooks/usePermisosModulo';
import ModalPatrocinador from '../components/ModalPatrocinador';
import TarjetaPatrocinador from '../components/TarjetaPatrocinador';
import ConfiguracionSeccion from '../components/ConfiguracionSeccion';
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
    const { puedeCrear, puedeEditar, puedeEliminar } = usePermisosModulo('personalizacion');

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
                <ConfiguracionSeccion puedeEditar={puedeEditar} />
            </section>

            <section className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">Patrocinadores</h2>
                        {puedeEditar && (
                            <p className="mt-1 text-sm text-foreground-soft">
                                Arrastra para cambiar el orden de aparición en la landing.
                                {guardandoOrden && ' Guardando orden...'}
                            </p>
                        )}
                    </div>
                    {puedeCrear && (
                        <button type="button" onClick={abrirCrear} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-on-primary rounded-lg font-semibold transition-colors cursor-pointer">
                            <Plus size={18} />Agregar patrocinador
                        </button>
                    )}
                </div>

                <Aviso tipo="exito" mensaje={mensajeExito} />
                <Aviso mensaje={error} onReintentar={cargarPatrocinadores} />

                {loading ? (
                    <EsqueletoLista texto="Cargando patrocinadores..." />
                ) : patrocinadores.length === 0 ? (
                    !error && <EstadoVacio mensaje="No hay patrocinadores registrados." />
                ) : (
                    <DndContext sensors={sensores} collisionDetection={closestCenter} onDragEnd={alTerminarArrastre}>
                        <SortableContext items={patrocinadores.map((item) => item.id_patrocinador)} strategy={verticalListSortingStrategy}>
                            <div className="space-y-2">
                                {patrocinadores.map((patrocinador) => (
                                    <TarjetaPatrocinador
                                        key={patrocinador.id_patrocinador}
                                        patrocinador={patrocinador}
                                        arrastrable={puedeEditar}
                                        onEditar={puedeEditar ? abrirEditar : undefined}
                                        onEliminar={puedeEliminar ? eliminacion.abrir : undefined}
                                        onToggleActivo={puedeEditar ? alternarActivo : undefined}
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
            <ModalConfirmarEliminacion
                open={Boolean(eliminacion.elemento)}
                titulo="Eliminar patrocinador"
                nombre={eliminacion.elemento?.nombre}
                textoBoton="Eliminar patrocinador"
                loading={eliminacion.eliminando}
                error={eliminacion.error}
                onClose={eliminacion.cerrar}
                onConfirm={eliminacion.confirmar}
            />
        </div>
    );
}
