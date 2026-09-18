import { useEffect, useState } from 'react';
import { Loader2, RefreshCw, Search } from 'lucide-react';
import EstadoBadge from '../../SolicitudesAgrupaciones/components/EstadoBadge';
import { formatearFecha } from '../../../utils/fecha';
import { obtenerAsignaciones } from '../services/asignacionBeneficiosService';
import { obtenerSolicitudes } from '../../SolicitudesAgrupaciones/services/solicitudService';

const FILTROS_INICIALES = { agrupacion: '', cedula: '', fecha: '' };

const construirSecciones = (asignacion) => {
    const secciones = [];

    if (asignacion.alimentaciones?.length) {
        secciones.push({
            titulo: 'Alimentación',
            items: asignacion.alimentaciones.map((item) => `${item.alimentacion?.tiempo_comida ?? '—'} x${item.cantidad}`),
        });
    }

    if (asignacion.mobiliarios?.length) {
        secciones.push({
            titulo: 'Mobiliario',
            items: asignacion.mobiliarios.map((item) => `${item.mobiliario?.nombre ?? '—'} x${item.cantidad}`),
        });
    }

    if (asignacion.aulas?.length) {
        secciones.push({
            titulo: 'Aulas',
            items: asignacion.aulas.map((item) => item.aula?.nombre ?? '—'),
        });
    }

    if (asignacion.transportes?.length) {
        secciones.push({
            titulo: 'Transporte',
            items: asignacion.transportes.map((item) => `${item.transporte?.matricula ?? item.matricula} — ${item.ruta?.nombre_ruta ?? '—'}`),
        });
    }

    return secciones;
};

function Dato({ label, value }) {
    return (
        <div>
            <p className="text-[11px] uppercase tracking-wider text-foreground-faint">{label}</p>
            <p className="text-sm text-foreground-soft truncate">{value || '—'}</p>
        </div>
    );
}

function TarjetaAsignacion({ asignacion }) {
    const solicitud = asignacion.solicitud_agrupacion;
    const encargado = solicitud?.agrupacion?.encargado;
    const secciones = construirSecciones(asignacion);

    return (
        <article className="bg-surface border border-border rounded-xl shadow-sm p-4 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs font-medium text-primary uppercase tracking-wider">Solicitud #{asignacion.id_solicitud_agrupacion}</p>
                    <h3 className="mt-1 text-base font-semibold text-foreground truncate">{solicitud?.agrupacion?.nombre ?? '—'}</h3>
                </div>
                {solicitud?.estado && <EstadoBadge estado={solicitud.estado} />}
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Dato label="Encargado" value={encargado ? `${encargado.primer_nombre} ${encargado.apellido}` : '—'} />
                <Dato label="Cédula" value={encargado?.cedula} />
                <Dato label="Fecha solicitada" value={formatearFecha(solicitud?.fecha_solicitada) ?? '—'} />
                <Dato label="Fecha asignada" value={formatearFecha(solicitud?.fecha_asignada) ?? 'Sin asignar'} />
            </div>

            <div className="pt-2 border-t border-border space-y-1">
                <p className="text-[11px] uppercase tracking-wider text-foreground-faint">Solicitud de beneficios</p>
                <p className="text-sm text-foreground-soft italic line-clamp-3">
                    {solicitud?.comentarios ? `"${solicitud.comentarios}"` : 'Sin comentario'}
                </p>
            </div>

            <div className="space-y-1">
                <p className="text-[11px] uppercase tracking-wider text-foreground-faint">Observaciones de la asignación</p>
                <p className="text-sm text-foreground-soft whitespace-pre-wrap">
                    {asignacion.observaciones || 'Sin observaciones'}
                </p>
            </div>

            {secciones.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-border">
                    {secciones.map((seccion) => (
                        <div key={seccion.titulo} className="space-y-1">
                            <h4 className="text-xs font-semibold text-primary uppercase tracking-wider">{seccion.titulo}</h4>
                            <ul className="space-y-0.5">
                                {seccion.items.map((item, indice) => (
                                    <li key={indice} className="text-sm text-foreground-soft">- {item}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}
        </article>
    );
}

export default function VerBeneficiosAsignados() {
    const [asignaciones, setAsignaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filtros, setFiltros] = useState(FILTROS_INICIALES);

    const enriquecerConAgrupacion = (listaAsignaciones, listaSolicitudes) => {
        const solicitudesPorId = new Map(listaSolicitudes.map((solicitud) => [solicitud.id, solicitud]));

        return listaAsignaciones.map((asignacion) => ({
            ...asignacion,
            solicitud_agrupacion: {
                ...asignacion.solicitud_agrupacion,
                agrupacion: asignacion.solicitud_agrupacion?.agrupacion
                    ?? solicitudesPorId.get(asignacion.id_solicitud_agrupacion)?.agrupacion
                    ?? null,
            },
        }));
    };

    useEffect(() => {
        let activo = true;

        Promise.all([obtenerAsignaciones(), obtenerSolicitudes()]).then(([resultadoAsignaciones, resultadoSolicitudes]) => {
            if (!activo) return;

            if (!resultadoAsignaciones.success) {
                setError(resultadoAsignaciones.error);
                setLoading(false);
                return;
            }

            const solicitudes = resultadoSolicitudes.success ? resultadoSolicitudes.data : [];
            setAsignaciones(enriquecerConAgrupacion(resultadoAsignaciones.data, solicitudes));
            setLoading(false);
        });

        return () => {
            activo = false;
        };
    }, []);

    const cargarDatos = async () => {
        setLoading(true);
        setError('');

        const [resultadoAsignaciones, resultadoSolicitudes] = await Promise.all([
            obtenerAsignaciones(),
            obtenerSolicitudes(),
        ]);

        if (!resultadoAsignaciones.success) {
            setError(resultadoAsignaciones.error);
            setLoading(false);
            return;
        }

        const solicitudes = resultadoSolicitudes.success ? resultadoSolicitudes.data : [];
        setAsignaciones(enriquecerConAgrupacion(resultadoAsignaciones.data, solicitudes));
        setLoading(false);
    };

    const asignacionesFiltradas = asignaciones.filter((asignacion) => {
        const solicitud = asignacion.solicitud_agrupacion;
        const nombreAgrupacion = solicitud?.agrupacion?.nombre?.toLowerCase() ?? '';
        const cedulaEncargado = (solicitud?.agrupacion?.encargado?.cedula ?? '').toLowerCase();

        if (filtros.agrupacion && !nombreAgrupacion.includes(filtros.agrupacion.trim().toLowerCase())) return false;
        if (filtros.cedula && !cedulaEncargado.includes(filtros.cedula.trim().toLowerCase())) return false;
        if (filtros.fecha && solicitud?.fecha_solicitada !== filtros.fecha && solicitud?.fecha_asignada !== filtros.fecha) return false;

        return true;
    });

    const hayFiltrosActivos = Boolean(filtros.agrupacion || filtros.cedula || filtros.fecha);
    const actualizarFiltro = (campo) => (event) => setFiltros((prev) => ({ ...prev, [campo]: event.target.value }));

    return (
        <div className="space-y-5">
            <div>
                <p className="text-sm text-foreground-faint">Beneficios</p>
                <h1 className="text-2xl font-bold text-primary">Beneficios asignados</h1>
                <p className="mt-1 text-sm text-foreground-soft">Consulta los beneficios ya asignados a solicitudes aprobadas.</p>
            </div>

            {error && (
                <div role="alert" className="p-3 bg-danger-soft border border-danger/30 rounded-lg text-danger text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <span>{error}</span>
                    <button type="button" onClick={cargarDatos} className="inline-flex items-center justify-center gap-2 px-3 py-1.5 border border-danger/40 rounded-lg font-medium hover:bg-danger/10 transition-colors cursor-pointer">
                        <RefreshCw size={14} />Reintentar
                    </button>
                </div>
            )}

            <div className="bg-surface border border-border rounded-xl p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-faint" />
                    <input
                        type="text"
                        value={filtros.agrupacion}
                        onChange={actualizarFiltro('agrupacion')}
                        placeholder="Nombre de agrupación..."
                        className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-foreground-faint focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>

                <input
                    type="text"
                    value={filtros.cedula}
                    onChange={actualizarFiltro('cedula')}
                    placeholder="Cédula del encargado..."
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-foreground-faint focus:outline-none focus:ring-2 focus:ring-primary"
                />

                <input
                    type="date"
                    value={filtros.fecha}
                    onChange={actualizarFiltro('fecha')}
                    aria-label="Filtrar por fecha"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
            </div>

            {loading ? (
                <div className="flex items-center justify-center gap-2 py-16 text-foreground-soft">
                    <Loader2 className="animate-spin text-primary" size={26} />Cargando asignaciones...
                </div>
            ) : asignacionesFiltradas.length === 0 ? (
                <div className="flex items-center justify-center py-16 border border-border rounded-xl bg-surface">
                    <p className="text-sm text-foreground-faint text-center">
                        {hayFiltrosActivos ? 'Ninguna asignación coincide con los filtros.' : 'Todavía no hay beneficios asignados.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {asignacionesFiltradas.map((asignacion) => (
                        <TarjetaAsignacion key={asignacion.id} asignacion={asignacion} />
                    ))}
                </div>
            )}
        </div>
    );
}
