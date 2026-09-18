import { useEffect, useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
import ModalBeneficio from './ModalBeneficio';
import ModalConfirmarEliminacionBeneficio from './ModalConfirmarEliminacionBeneficio';
import TarjetaBeneficio from './TarjetaBeneficio';
import { BENEFICIO_CONFIG, actualizarBeneficio, crearBeneficio, eliminarBeneficio, obtenerBeneficios } from '../services/beneficioService';

const CATEGORIA = 'ruta';

export default function SeccionRutas() {
    const [rutas, setRutas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [eliminando, setEliminando] = useState(false);
    const [error, setError] = useState('');
    const [erroresCampos, setErroresCampos] = useState({});
    const [modal, setModal] = useState({ abierto: false, modo: 'crear', ruta: null });
    const [rutaAEliminar, setRutaAEliminar] = useState(null);
    const config = BENEFICIO_CONFIG[CATEGORIA];

    useEffect(() => {
        let activo = true;

        obtenerBeneficios(CATEGORIA).then((resultado) => {
            if (!activo) return;
            if (resultado.success) setRutas(resultado.data);
            else setError(resultado.error);
            setLoading(false);
        });

        return () => {
            activo = false;
        };
    }, []);

    const abrirCrear = () => {
        setError('');
        setErroresCampos({});
        setModal({ abierto: true, modo: 'crear', ruta: null });
    };

    const abrirEditar = (ruta) => {
        setError('');
        setErroresCampos({});
        setModal({ abierto: true, modo: 'editar', ruta });
    };

    const cerrarModal = () => {
        if (guardando) return;
        setModal((prev) => ({ ...prev, abierto: false }));
        setErroresCampos({});
    };

    const guardarRuta = async (_categoria, payload) => {
        setGuardando(true);
        setError('');
        setErroresCampos({});
        const id = modal.ruta?.[config.idField];
        const resultado = modal.modo === 'editar'
            ? await actualizarBeneficio(CATEGORIA, id, payload)
            : await crearBeneficio(CATEGORIA, payload);
        setGuardando(false);

        if (!resultado.success) {
            setError(resultado.error);
            setErroresCampos(resultado.errors ?? {});
            return;
        }

        setRutas((prev) => modal.modo === 'editar'
            ? prev.map((item) => item[config.idField] === resultado.data[config.idField] ? resultado.data : item)
            : [...prev, resultado.data]);
        cerrarModal();
    };

    const cerrarEliminar = () => {
        if (!eliminando) setRutaAEliminar(null);
    };

    const confirmarEliminacion = async () => {
        if (!rutaAEliminar) return;
        setEliminando(true);
        setError('');
        const id = rutaAEliminar[config.idField];
        const resultado = await eliminarBeneficio(CATEGORIA, id);
        setEliminando(false);
        if (!resultado.success) {
            setError(resultado.error);
            return;
        }
        setRutas((prev) => prev.filter((item) => item[config.idField] !== id));
        setRutaAEliminar(null);
    };

    return (
        <div className="space-y-3 pt-4 mt-2 border-t border-border">
            <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-foreground-soft uppercase tracking-wider">Rutas de transporte</p>
                <button
                    type="button"
                    onClick={abrirCrear}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-primary text-primary hover:bg-primary/10 text-xs font-semibold transition-colors cursor-pointer"
                >
                    <Plus size={14} />Agregar ruta
                </button>
            </div>

            {error && <div role="alert" className="p-3 bg-danger-soft border border-danger/30 rounded-lg text-danger text-sm">{error}</div>}

            {loading ? (
                <div className="flex items-center justify-center gap-2 py-8 text-foreground-soft">
                    <Loader2 className="animate-spin text-primary" size={20} />Cargando rutas...
                </div>
            ) : rutas.length === 0 ? (
                <p className="text-sm text-foreground-faint py-4">No hay rutas registradas.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {rutas.map((ruta) => (
                        <TarjetaBeneficio key={ruta.id_ruta} categoria={CATEGORIA} beneficio={ruta} onEditar={abrirEditar} onEliminar={setRutaAEliminar} />
                    ))}
                </div>
            )}

            <ModalBeneficio
                key={`${modal.abierto}-${modal.modo}-${modal.ruta?.id_ruta ?? 'nueva'}`}
                open={modal.abierto}
                modo={modal.modo}
                categoriaInicial={CATEGORIA}
                beneficio={modal.ruta}
                loading={guardando}
                error={error}
                errors={erroresCampos}
                onClose={cerrarModal}
                onSubmit={guardarRuta}
                ocultarSelectorCategoria
            />
            <ModalConfirmarEliminacionBeneficio
                categoria={CATEGORIA}
                beneficio={rutaAEliminar}
                loading={eliminando}
                error={rutaAEliminar ? error : ''}
                onClose={cerrarEliminar}
                onConfirm={confirmarEliminacion}
            />
        </div>
    );
}
