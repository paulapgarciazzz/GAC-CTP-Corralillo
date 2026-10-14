import { useEffect, useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import FiltrosSolicitudesAprobadas from '../components/FiltrosSolicitudesAprobadas';
import ListaSolicitudesAprobadas from '../components/ListaSolicitudesAprobadas';
import ModalAsignacionBeneficios from '../components/ModalAsignacionBeneficios';
import { actualizarAsignacion, crearAsignacion, obtenerAsignaciones, obtenerSolicitudesAprobadas } from '../services/asignacionBeneficiosService';

const FILTROS_INICIALES = { agrupacion: '', cedula: '', fecha: '', estadoAsignacion: 'todas' };

export default function AsignarBeneficios() {
    const [solicitudes, setSolicitudes] = useState([]);
    const [asignaciones, setAsignaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [mensajeExito, setMensajeExito] = useState('');
    const [filtros, setFiltros] = useState(FILTROS_INICIALES);
    const [modal, setModal] = useState({ abierto: false, solicitud: null });
    const [guardando, setGuardando] = useState(false);
    const [errorModal, setErrorModal] = useState('');

    const cargarDatos = async () => {
        setLoading(true);
        setError('');

        const [resultadoSolicitudes, resultadoAsignaciones] = await Promise.all([
            obtenerSolicitudesAprobadas(),
            obtenerAsignaciones(),
        ]);

        if (!resultadoSolicitudes.success) {
            setError(resultadoSolicitudes.error);
            setLoading(false);
            return;
        }

        setSolicitudes(resultadoSolicitudes.data);
        setAsignaciones(resultadoAsignaciones.success ? resultadoAsignaciones.data : []);
        if (!resultadoAsignaciones.success) {
            setError(resultadoAsignaciones.error);
        }
        setLoading(false);
    };

    useEffect(() => {
        let activo = true;

        Promise.all([
            obtenerSolicitudesAprobadas(),
            obtenerAsignaciones(),
        ]).then(([resultadoSolicitudes, resultadoAsignaciones]) => {
            if (!activo) return;

            if (!resultadoSolicitudes.success) {
                setError(resultadoSolicitudes.error);
                setLoading(false);
                return;
            }

            setSolicitudes(resultadoSolicitudes.data);
            setAsignaciones(resultadoAsignaciones.success ? resultadoAsignaciones.data : []);
            if (!resultadoAsignaciones.success) {
                setError(resultadoAsignaciones.error);
            }
            setLoading(false);
        });

        return () => {
            activo = false;
        };
    }, []);

    const mostrarExito = (mensaje) => {
        setMensajeExito(mensaje);
        window.setTimeout(() => setMensajeExito(''), 3500);
    };

    const mapaAsignaciones = new Map(asignaciones.map((asignacion) => [asignacion.id_solicitud_agrupacion, asignacion]));
    const solicitudesConAsignacion = solicitudes.map((solicitud) => ({
        ...solicitud,
        asignacion: mapaAsignaciones.get(solicitud.id) ?? null,
    }));

    const solicitudesFiltradas = solicitudesConAsignacion.filter((solicitud) => {
        const nombreAgrupacion = solicitud.agrupacion?.nombre?.toLowerCase() ?? '';
        const cedulaEncargado = (solicitud.encargado?.cedula ?? solicitud.agrupacion?.encargado?.cedula ?? '').toLowerCase();

        if (filtros.agrupacion && !nombreAgrupacion.includes(filtros.agrupacion.trim().toLowerCase())) return false;
        if (filtros.cedula && !cedulaEncargado.includes(filtros.cedula.trim().toLowerCase())) return false;
        if (filtros.fecha && solicitud.fecha_solicitada !== filtros.fecha && solicitud.fecha_asignada !== filtros.fecha) return false;
        if (filtros.estadoAsignacion === 'pendiente' && solicitud.asignacion) return false;
        if (filtros.estadoAsignacion === 'asignada' && !solicitud.asignacion) return false;

        return true;
    });

    const abrirAsignacion = (solicitud) => {
        setErrorModal('');
        setModal({ abierto: true, solicitud });
    };

    const cerrarModal = () => {
        if (guardando) return;
        setModal({ abierto: false, solicitud: null });
        setErrorModal('');
    };

    const guardarAsignacion = async (payload) => {
        setGuardando(true);
        setErrorModal('');

        const asignacionExistente = modal.solicitud?.asignacion;
        const resultado = asignacionExistente
            ? await actualizarAsignacion(asignacionExistente.id, payload)
            : await crearAsignacion({ id_solicitud_agrupacion: modal.solicitud.id, ...payload });

        setGuardando(false);

        if (!resultado.success) {
            setErrorModal(resultado.error);
            return;
        }

        setAsignaciones((prev) => [
            ...prev.filter((asignacion) => asignacion.id_solicitud_agrupacion !== resultado.data.id_solicitud_agrupacion),
            resultado.data,
        ]);
        setModal({ abierto: false, solicitud: null });
        mostrarExito(asignacionExistente ? 'Asignación actualizada correctamente.' : 'Asignación creada correctamente.');
    };

    const hayFiltrosActivos = Boolean(
        filtros.agrupacion || filtros.cedula || filtros.fecha || filtros.estadoAsignacion !== 'todas'
    );

    return (
        <div className="space-y-5">
            <div>
                <p className="text-sm text-foreground-faint">Beneficios</p>
                <h1 className="text-2xl font-bold text-primary">Asignar beneficios</h1>
                <p className="mt-1 text-sm text-foreground-soft">Selecciona una solicitud aprobada para asignarle beneficios.</p>
            </div>

            {mensajeExito && <div role="status" className="p-3 bg-success-soft border border-success/30 rounded-lg text-success text-sm">{mensajeExito}</div>}
            {error && (
                <div role="alert" className="p-3 bg-danger-soft border border-danger/30 rounded-lg text-danger text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <span>{error}</span>
                    <button type="button" onClick={cargarDatos} className="inline-flex items-center justify-center gap-2 px-3 py-1.5 border border-danger/40 rounded-lg font-medium hover:bg-danger/10 transition-colors cursor-pointer">
                        <RefreshCw size={14} />Reintentar
                    </button>
                </div>
            )}

            <FiltrosSolicitudesAprobadas filtros={filtros} onChange={setFiltros} />

            {loading ? (
                <div className="flex items-center justify-center gap-2 py-16 text-foreground-soft">
                    <Loader2 className="animate-spin text-primary" size={26} />Cargando solicitudes...
                </div>
            ) : (
                <ListaSolicitudesAprobadas
                    solicitudes={solicitudesFiltradas}
                    onSeleccionar={abrirAsignacion}
                    hayFiltrosActivos={hayFiltrosActivos}
                />
            )}

            <ModalAsignacionBeneficios
                key={modal.solicitud?.id ?? 'cerrado'}
                open={modal.abierto}
                solicitud={modal.solicitud}
                asignacion={modal.solicitud?.asignacion ?? null}
                loading={guardando}
                error={errorModal}
                onClose={cerrarModal}
                onSubmit={guardarAsignacion}
            />
        </div>
    );
}
