import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import ModalBase from './ModalBase';
import { AlertaError, BotonesFormulario, CampoFormulario } from './Formulario';
import { INPUT_CLASS } from '../lib/formulario';
import { formatearRangoEvento } from '../lib/fechas';
import { obtenerUbicaciones } from '../services/ubicacionService';
import { obtenerAgrupacionesAprobadas } from '../services/actividadService';

export default function ModalActividad({ open, evento, actividad, onClose, onGuardar }) {
    if (!open || !evento) return null;

    return (
        <FormularioActividad
            key={actividad?.id_actividad ?? `nueva-${evento.id}`}
            evento={evento}
            actividad={actividad}
            onClose={onClose}
            onGuardar={onGuardar}
        />
    );
}

function FormularioActividad({ evento, actividad, onClose, onGuardar }) {
    const esEdicion = Boolean(actividad);
    const fechaMin = format(evento.start, 'yyyy-MM-dd');
    const fechaMax = format(evento.end, 'yyyy-MM-dd');

    const [valores, setValores] = useState({
        titulo: actividad?.titulo ?? '',
        fecha: actividad?.fecha ?? fechaMin,
        hora_inicio: actividad?.hora_inicio ?? '',
        hora_finalizacion: actividad?.hora_finalizacion ?? '',
        id_ubicacion: actividad?.id_ubicacion ? String(actividad.id_ubicacion) : '',
        id_agrupacion: actividad?.id_agrupacion ? String(actividad.id_agrupacion) : '',
    });
    const [ubicaciones, setUbicaciones] = useState([]);
    const [agrupaciones, setAgrupaciones] = useState([]);
    const [cargandoOpciones, setCargandoOpciones] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');
    const [errores, setErrores] = useState({});

    useEffect(() => {
        let activo = true;

        Promise.all([obtenerUbicaciones(), obtenerAgrupacionesAprobadas(evento.id)]).then(([resUbicaciones, resAgrupaciones]) => {
            if (!activo) return;
            if (resUbicaciones.success) setUbicaciones(resUbicaciones.data);
            if (resAgrupaciones.success) setAgrupaciones(resAgrupaciones.data);
            const fallo = [resUbicaciones, resAgrupaciones].find((resultado) => !resultado.success);
            if (fallo) setError(fallo.error);
            setCargandoOpciones(false);
        });

        return () => {
            activo = false;
        };
    }, [evento.id]);

    // Si la agrupación actual ya no está aprobada se mantiene visible para no perder el dato al abrir.
    const opcionesAgrupacion = actividad?.agrupacion && !agrupaciones.some((a) => a.id === actividad.agrupacion.id)
        ? [...agrupaciones, { ...actividad.agrupacion, noAprobada: true }]
        : agrupaciones;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setValores((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const titulo = valores.titulo.trim();
        if (!titulo || !valores.fecha || !valores.hora_inicio || !valores.hora_finalizacion) {
            setError('El título, la fecha y las horas son obligatorios.');
            return;
        }
        if (valores.fecha < fechaMin || valores.fecha > fechaMax) {
            setError('La fecha debe estar dentro de las fechas del evento.');
            return;
        }
        if (valores.hora_finalizacion <= valores.hora_inicio) {
            setError('La hora de finalización debe ser posterior a la hora de inicio.');
            return;
        }

        setError('');
        setErrores({});
        setGuardando(true);
        const resultado = await onGuardar({
            titulo,
            fecha: valores.fecha,
            hora_inicio: valores.hora_inicio,
            hora_finalizacion: valores.hora_finalizacion,
            id_ubicacion: valores.id_ubicacion ? Number(valores.id_ubicacion) : null,
            id_agrupacion: valores.id_agrupacion ? Number(valores.id_agrupacion) : null,
        });
        setGuardando(false);

        if (!resultado.success) {
            setError(resultado.error);
            setErrores(resultado.errors ?? {});
        }
    };

    return (
        <ModalBase
            titulo={esEdicion ? 'Editar actividad' : 'Agregar actividad'}
            subtitulo={`${evento.title} · ${formatearRangoEvento(evento)}`}
            bloqueado={guardando}
            onClose={onClose}
        >
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <CampoFormulario id="actividad-titulo" label="Título" error={errores.titulo?.[0]}>
                    <input id="actividad-titulo" name="titulo" type="text" value={valores.titulo} onChange={handleChange} required maxLength={150} className={INPUT_CLASS} />
                </CampoFormulario>

                <CampoFormulario id="actividad-fecha" label="Fecha" error={errores.fecha?.[0]}>
                    <input id="actividad-fecha" name="fecha" type="date" min={fechaMin} max={fechaMax} value={valores.fecha} onChange={handleChange} required className={INPUT_CLASS} />
                </CampoFormulario>

                <div className="grid sm:grid-cols-2 gap-4">
                    <CampoFormulario id="actividad-hora-inicio" label="Hora de inicio" error={errores.hora_inicio?.[0]}>
                        <input id="actividad-hora-inicio" name="hora_inicio" type="time" value={valores.hora_inicio} onChange={handleChange} required className={INPUT_CLASS} />
                    </CampoFormulario>
                    <CampoFormulario id="actividad-hora-fin" label="Hora de finalización" error={errores.hora_finalizacion?.[0]}>
                        <input id="actividad-hora-fin" name="hora_finalizacion" type="time" value={valores.hora_finalizacion} onChange={handleChange} required className={INPUT_CLASS} />
                    </CampoFormulario>
                </div>

                <CampoFormulario id="actividad-ubicacion" label="Ubicación" error={errores.id_ubicacion?.[0]}>
                    <select id="actividad-ubicacion" name="id_ubicacion" value={valores.id_ubicacion} onChange={handleChange} disabled={cargandoOpciones} className={INPUT_CLASS}>
                        <option value="">Sin ubicación</option>
                        {ubicaciones.map((ubicacion) => (
                            <option key={ubicacion.id_ubicacion} value={ubicacion.id_ubicacion}>
                                {ubicacion.nombre} (capacidad {ubicacion.capacidad})
                            </option>
                        ))}
                    </select>
                    {!cargandoOpciones && ubicaciones.length === 0 && (
                        <p className="text-xs text-foreground-faint">No hay ubicaciones registradas. Puedes crearlas en Ajustes → Gestión de ubicaciones.</p>
                    )}
                </CampoFormulario>

                <CampoFormulario id="actividad-agrupacion" label="Agrupación (opcional)" error={errores.id_agrupacion?.[0]}>
                    <select id="actividad-agrupacion" name="id_agrupacion" value={valores.id_agrupacion} onChange={handleChange} disabled={cargandoOpciones} className={INPUT_CLASS}>
                        <option value="">Sin agrupación</option>
                        {opcionesAgrupacion.map((agrupacion) => (
                            <option key={agrupacion.id} value={agrupacion.id}>
                                {agrupacion.nombre}{agrupacion.noAprobada ? ' (ya no aprobada para este evento)' : ''}
                            </option>
                        ))}
                    </select>
                    {!cargandoOpciones && agrupaciones.length === 0 && (
                        <p className="text-xs text-foreground-faint">No hay agrupaciones con solicitud aprobada para este evento.</p>
                    )}
                </CampoFormulario>

                <AlertaError mensaje={error} />

                <BotonesFormulario
                    guardando={guardando}
                    deshabilitarEnviar={cargandoOpciones}
                    textoEnviar={esEdicion ? 'Guardar cambios' : 'Agregar actividad'}
                    onCancel={onClose}
                />
            </form>
        </ModalBase>
    );
}
