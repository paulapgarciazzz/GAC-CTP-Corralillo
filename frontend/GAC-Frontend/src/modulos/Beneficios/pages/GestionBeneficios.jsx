import { useEffect, useState } from 'react';
import { Loader2, Plus, RefreshCw } from 'lucide-react';
import ModalBeneficio from '../components/ModalBeneficio';
import ModalConfirmarEliminacionBeneficio from '../components/ModalConfirmarEliminacionBeneficio';
import SeccionRutas from '../components/SeccionRutas';
import SelectorCategoriaBeneficio from '../components/SelectorCategoriaBeneficio';
import TarjetaBeneficio from '../components/TarjetaBeneficio';
import { BENEFICIO_CONFIG, actualizarBeneficio, crearBeneficio, eliminarBeneficio, obtenerBeneficios } from '../services/beneficioService';

export default function GestionBeneficios() {
    const [categoria, setCategoria] = useState('alimentacion');
    const [beneficios, setBeneficios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [eliminando, setEliminando] = useState(false);
    const [error, setError] = useState('');
    const [mensajeExito, setMensajeExito] = useState('');
    const [erroresCampos, setErroresCampos] = useState({});
    const [modal, setModal] = useState({ abierto: false, modo: 'crear', categoria: 'alimentacion', beneficio: null });
    const [beneficioAEliminar, setBeneficioAEliminar] = useState(null);
    const config = BENEFICIO_CONFIG[categoria];

    const cargarBeneficios = async () => {
        setLoading(true);
        setError('');
        const resultado = await obtenerBeneficios(categoria);
        if (resultado.success) setBeneficios(resultado.data);
        else setError(resultado.error);
        setLoading(false);
    };

    useEffect(() => {
        let activo = true;

        obtenerBeneficios(categoria).then((resultado) => {
            if (!activo) return;
            if (resultado.success) setBeneficios(resultado.data);
            else setError(resultado.error);
            setLoading(false);
        });

        return () => {
            activo = false;
        };
    }, [categoria]);

    const mostrarExito = (mensaje) => {
        setMensajeExito(mensaje);
        window.setTimeout(() => setMensajeExito(''), 3500);
    };

    const abrirCrear = () => {
        setError('');
        setErroresCampos({});
        setModal({ abierto: true, modo: 'crear', categoria, beneficio: null });
    };

    const abrirEditar = (beneficio) => {
        setError('');
        setErroresCampos({});
        setModal({ abierto: true, modo: 'editar', categoria, beneficio });
    };

    const cerrarModal = () => {
        if (guardando) return;
        setModal((prev) => ({ ...prev, abierto: false }));
        setErroresCampos({});
    };

    const guardarBeneficio = async (categoriaFormulario, payload) => {
        setGuardando(true);
        setError('');
        setErroresCampos({});
        const id = modal.beneficio?.[BENEFICIO_CONFIG[categoriaFormulario].idField];
        const resultado = modal.modo === 'editar'
            ? await actualizarBeneficio(categoriaFormulario, id, payload)
            : await crearBeneficio(categoriaFormulario, payload);
        setGuardando(false);

        if (!resultado.success) {
            setError(resultado.error);
            setErroresCampos(resultado.errors ?? {});
            return;
        }

        const idField = BENEFICIO_CONFIG[categoriaFormulario].idField;
        setBeneficios((prev) => modal.modo === 'editar'
            ? prev.map((item) => item[idField] === resultado.data[idField] ? resultado.data : item)
            : [...prev, resultado.data]);
        cerrarModal();
        mostrarExito(modal.modo === 'editar' ? 'Beneficio actualizado correctamente.' : 'Beneficio creado correctamente.');
    };

    const abrirEliminar = (beneficio) => {
        setError('');
        setBeneficioAEliminar(beneficio);
    };

    const cerrarEliminar = () => {
        if (!eliminando) setBeneficioAEliminar(null);
    };

    const confirmarEliminacion = async () => {
        if (!beneficioAEliminar) return;
        setEliminando(true);
        setError('');
        const id = beneficioAEliminar[config.idField];
        const resultado = await eliminarBeneficio(categoria, id);
        setEliminando(false);
        if (!resultado.success) {
            setError(resultado.error);
            return;
        }
        setBeneficios((prev) => prev.filter((item) => item[config.idField] !== id));
        setBeneficioAEliminar(null);
        mostrarExito('Beneficio eliminado correctamente.');
    };

    return (
        <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                    <p className="text-sm text-foreground-faint">Beneficios</p>
                    <h1 className="text-2xl font-bold text-primary">Gestión de beneficios</h1>
                    <p className="mt-1 text-sm text-foreground-soft">Administra los catálogos disponibles para las actividades.</p>
                </div>
                <button type="button" onClick={abrirCrear} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold transition-colors cursor-pointer">
                    <Plus size={18} />Agregar beneficio
                </button>
            </div>

            {mensajeExito && <div role="status" className="p-3 bg-success-soft border border-success/30 rounded-lg text-success text-sm">{mensajeExito}</div>}
            {error && !beneficioAEliminar && <div role="alert" className="p-3 bg-danger-soft border border-danger/30 rounded-lg text-danger text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"><span>{error}</span><button type="button" onClick={cargarBeneficios} className="inline-flex items-center justify-center gap-2 px-3 py-1.5 border border-danger/40 rounded-lg font-medium hover:bg-danger/10 transition-colors cursor-pointer"><RefreshCw size={14} />Reintentar</button></div>}

            <div className="bg-surface border border-border rounded-xl p-3 sm:p-4">
                <p className="text-xs font-medium text-foreground-soft uppercase tracking-wider mb-3">Categoría</p>
                <SelectorCategoriaBeneficio
                    value={categoria}
                    onChange={(nuevaCategoria) => {
                        setLoading(true);
                        setError('');
                        setCategoria(nuevaCategoria);
                    }}
                />
            </div>

            {loading ? (
                <div className="flex items-center justify-center gap-2 py-16 text-foreground-soft"><Loader2 className="animate-spin text-primary" size={26} />Cargando beneficios...</div>
            ) : beneficios.length === 0 ? (
                <div className="flex items-center justify-center py-16 border border-border rounded-xl bg-surface"><p className="text-sm text-foreground-faint text-center">No hay registros en {config.label.toLowerCase()}.</p></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {beneficios.map((beneficio) => (
                        <TarjetaBeneficio key={beneficio[config.idField]} categoria={categoria} beneficio={beneficio} onEditar={abrirEditar} onEliminar={abrirEliminar} />
                    ))}
                </div>
            )}

            {categoria === 'transporte' && <SeccionRutas />}

            <ModalBeneficio
                key={`${modal.abierto}-${modal.modo}-${modal.categoria}-${modal.beneficio?.[BENEFICIO_CONFIG[modal.categoria].idField] ?? 'nuevo'}`}
                open={modal.abierto}
                modo={modal.modo}
                categoriaInicial={modal.categoria}
                beneficio={modal.beneficio}
                loading={guardando}
                error={error}
                errors={erroresCampos}
                onClose={cerrarModal}
                onSubmit={guardarBeneficio}
            />
            <ModalConfirmarEliminacionBeneficio
                categoria={categoria}
                beneficio={beneficioAEliminar}
                loading={eliminando}
                error={beneficioAEliminar ? error : ''}
                onClose={cerrarEliminar}
                onConfirm={confirmarEliminacion}
            />
        </div>
    );
}
