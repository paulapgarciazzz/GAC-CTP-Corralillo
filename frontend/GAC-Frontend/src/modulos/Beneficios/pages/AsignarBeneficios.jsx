import { useEffect, useState } from 'react';
import Aviso from '../../../components/Aviso';
import { EsqueletoLista } from '../../../components/EstadoLista';
import FiltrosSolicitudesAprobadas from '../components/FiltrosSolicitudesAprobadas';
import ListaSolicitudesAprobadas from '../components/ListaSolicitudesAprobadas';
import ModalAsignacionBeneficios from '../components/ModalAsignacionBeneficios';
import { usePermisosModulo } from '../../../auth/hooks/usePermisosModulo';
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
    const { puedeCrear, puedeEditar } = usePermisosModulo('beneficios');
    // Asignar por primera vez es crear; cambiar una asignación existente es editar.
    const puedeSeleccionar = (solicitud) => (solicitud.asignacion ? puedeEditar : puedeCrear);

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
                <h1 className="text-2xl font-semibold text-foreground">Asignar beneficios</h1>
                <p className="mt-1 text-sm text-foreground-soft">Selecciona una solicitud aprobada para asignarle beneficios.</p>
            </div>

            <Aviso tipo="exito" mensaje={mensajeExito} />
            <Aviso mensaje={error} onReintentar={cargarDatos} />

            <FiltrosSolicitudesAprobadas filtros={filtros} onChange={setFiltros} />

            {loading ? (
                <EsqueletoLista texto="Cargando solicitudes..." />
            ) : (
                <ListaSolicitudesAprobadas
                    solicitudes={solicitudesFiltradas}
                    onSeleccionar={abrirAsignacion}
                    puedeSeleccionar={puedeSeleccionar}
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
