import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { crearSolicitudParaEncargadoExistente } from '../services/solicitudService';
import { buscarEncargadoConAgrupaciones, actualizarEncargado } from '../services/encargadoService';
import { TIPOS_IDENTIFICACION, obtenerConfigIdentificacion, formatearValorIdentificacion } from '../../../utils/identificacion';
import { PAISES_TELEFONO, CODIGO_PAIS_POR_DEFECTO, MAX_DIGITOS_PREFIJO_CUSTOM, obtenerConfigTelefono, combinarNumeroTelefono, parsearNumeroTelefono } from '../../../utils/telefono';
import { obtenerFechaLocalISO } from '../../../utils/fecha';
import CampoArchivoAdjunto from '../../../components/CampoArchivoAdjunto';

const valoresListoIniciales = {
    email: '',
    codigo_pais_tel: CODIGO_PAIS_POR_DEFECTO,
    prefijo_custom_tel: '',
    numero_tel: '',
    nombre: '',
    lugar_procedencia: '',
    cantidad_integrantes: '',
    archivo_adjunto: null,
    archivo_adjunto_nombre: '',
    fecha_asignada: '',
    hora_asignada: '',
    comentarios: '',
};

const hoy = obtenerFechaLocalISO();

const CAMPOS_SOLO_LETRAS = ['nombre', 'lugar_procedencia'];
const REGEX_NO_LETRA = /[^A-Za-zÁÉÍÓÚÑÜáéíóúñü\s]/;

const TIPOS_ARCHIVO_ADJUNTO_ACEPTADOS = ['image/png', 'image/jpeg', 'application/pdf'];
const TAMANO_MAXIMO_ARCHIVO_ADJUNTO = 4 * 1024 * 1024;

function CampoSoloLectura({ etiqueta, valor }) {
    return (
        <div className="space-y-1">
            <p className="text-xs font-medium text-foreground-soft uppercase tracking-wider block">{etiqueta}</p>
            <p className="text-sm text-foreground px-4 py-2 border border-border rounded-lg bg-background">{valor}</p>
        </div>
    );
}

export default function FormularioSolicitudExistente({ onSuccess }) {
    const [paso, setPaso] = useState('buscar');

    const [tipoIdentificacionBusqueda, setTipoIdentificacionBusqueda] = useState('cedula');
    const [cedulaBusqueda, setCedulaBusqueda] = useState('');
    const [errorCedulaBusqueda, setErrorCedulaBusqueda] = useState('');
    const [loadingBusqueda, setLoadingBusqueda] = useState(false);
    const [notFound, setNotFound] = useState(false);
    const [errorBusqueda, setErrorBusqueda] = useState('');

    const [encargadoOriginal, setEncargadoOriginal] = useState(null);
    const [agrupaciones, setAgrupaciones] = useState([]);
    const [modoAgrupacion, setModoAgrupacion] = useState('existente');
    const [idAgrupacionSeleccionada, setIdAgrupacionSeleccionada] = useState('');

    const [valores, setValores] = useState(valoresListoIniciales);
    const [errores, setErrores] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const configIdentificacionBusqueda = obtenerConfigIdentificacion(tipoIdentificacionBusqueda);
    const configTelefono = obtenerConfigTelefono(valores.codigo_pais_tel);

    const handleTipoIdentificacionBusquedaChange = (e) => {
        setTipoIdentificacionBusqueda(e.target.value);
        setCedulaBusqueda('');
        setErrorCedulaBusqueda('');
    };

    const handleCedulaBusquedaChange = (e) => {
        let { value } = e.target;
        const regexInvalido = configIdentificacionBusqueda.soloNumeros ? /\D/ : /[^A-Za-z0-9]/;
        setErrorCedulaBusqueda(regexInvalido.test(value) ? configIdentificacionBusqueda.mensajeError : '');
        value = formatearValorIdentificacion(tipoIdentificacionBusqueda, value);
        setCedulaBusqueda(value);
    };

    const handleBuscar = async (e) => {
        e.preventDefault();
        setErrorBusqueda('');
        setNotFound(false);
        setLoadingBusqueda(true);

        const resultado = await buscarEncargadoConAgrupaciones(cedulaBusqueda);
        setLoadingBusqueda(false);

        if (resultado.notFound) {
            setNotFound(true);
            return;
        }
        if (!resultado.success) {
            setErrorBusqueda(resultado.error);
            return;
        }

        const { encargado, agrupaciones: agrupacionesEncontradas } = resultado;
        const telefono = parsearNumeroTelefono(encargado.numero_tel);

        setEncargadoOriginal(encargado);
        setAgrupaciones(agrupacionesEncontradas);
        setModoAgrupacion(agrupacionesEncontradas.length ? 'existente' : 'nueva');
        setIdAgrupacionSeleccionada(agrupacionesEncontradas[0]?.id ?? '');
        setValores((prev) => ({
            ...prev,
            email: encargado.email,
            codigo_pais_tel: telefono.codigoPais,
            prefijo_custom_tel: telefono.prefijoCustom,
            numero_tel: telefono.numero,
        }));
        setPaso('listo');
    };

    const handleChange = (e) => {
        const { name } = e.target;
        let { value } = e.target;
        let mensaje = '';

        if (CAMPOS_SOLO_LETRAS.includes(name)) {
            if (REGEX_NO_LETRA.test(value)) mensaje = 'Solo se permiten letras y espacios';
            value = value.replace(/[^A-Za-zÁÉÍÓÚÑÜáéíóúñü\s]/g, '');
        }

        setErrores((prev) => ({ ...prev, [name]: mensaje }));
        setValores((prev) => ({ ...prev, [name]: value }));
    };

    const handleCodigoPaisChange = (e) => {
        const codigo_pais_tel = e.target.value;
        setValores((prev) => ({ ...prev, codigo_pais_tel, numero_tel: '', prefijo_custom_tel: '' }));
    };

    const handlePrefijoCustomChange = (e) => {
        const prefijo_custom_tel = e.target.value.replace(/\D/g, '').slice(0, MAX_DIGITOS_PREFIJO_CUSTOM);
        setValores((prev) => ({ ...prev, prefijo_custom_tel }));
    };

    const handleNumeroTelChange = (e) => {
        const numero_tel = e.target.value.replace(/\D/g, '').slice(0, configTelefono.maxLength);
        setValores((prev) => ({ ...prev, numero_tel }));
    };

    const handleArchivoAdjuntoChange = (e) => {
        const archivo = e.target.files?.[0];
        if (!archivo) return;

        if (!TIPOS_ARCHIVO_ADJUNTO_ACEPTADOS.includes(archivo.type)) {
            setErrores((prev) => ({ ...prev, archivo_adjunto: 'Debe ser una imagen PNG/JPG o un PDF.' }));
            return;
        }
        if (archivo.size > TAMANO_MAXIMO_ARCHIVO_ADJUNTO) {
            setErrores((prev) => ({ ...prev, archivo_adjunto: 'El archivo no debe superar 4MB.' }));
            return;
        }

        setErrores((prev) => ({ ...prev, archivo_adjunto: '' }));
        const reader = new FileReader();
        reader.onload = () => {
            setValores((prev) => ({ ...prev, archivo_adjunto: reader.result, archivo_adjunto_nombre: archivo.name }));
        };
        reader.readAsDataURL(archivo);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const numeroTelCombinado = combinarNumeroTelefono({
            codigoPais: valores.codigo_pais_tel,
            prefijoCustom: valores.prefijo_custom_tel,
            numero: valores.numero_tel,
        });

        const datosEncargadoModificados = {};
        if (valores.email !== encargadoOriginal.email) {
            datosEncargadoModificados.email = valores.email;
        }
        if (numeroTelCombinado !== encargadoOriginal.numero_tel) {
            datosEncargadoModificados.numero_tel = numeroTelCombinado;
        }

        if (Object.keys(datosEncargadoModificados).length > 0) {
            const resultadoActualizacion = await actualizarEncargado(encargadoOriginal.cedula, datosEncargadoModificados);
            if (!resultadoActualizacion.success) {
                setLoading(false);
                setError(resultadoActualizacion.error);
                return;
            }
        }

        const result = await crearSolicitudParaEncargadoExistente({
            cedula: encargadoOriginal.cedula,
            modoAgrupacion,
            idAgrupacionSeleccionada,
            agrupacion: {
                nombre: valores.nombre,
                lugar_procedencia: valores.lugar_procedencia,
                cantidad_integrantes: valores.cantidad_integrantes,
                archivo_adjunto: valores.archivo_adjunto,
            },
            solicitud: {
                fecha_solicitud: obtenerFechaLocalISO(),
                fecha_asignada: valores.fecha_asignada,
                hora_asignada: valores.hora_asignada,
                comentarios: valores.comentarios,
            },
        });

        setLoading(false);

        if (result.success) {
            onSuccess?.();
        } else {
            setError(result.error);
        }
    };

    if (paso === 'buscar') {
        return (
            <form onSubmit={handleBuscar} className="space-y-6" noValidate>
                <p className="text-sm text-foreground-soft text-center">
                    Ingresa el número de identificación con el que participaste anteriormente para recuperar tus datos.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label htmlFor="tipo_identificacion_busqueda" className="text-xs font-medium text-foreground-soft uppercase tracking-wider block">Tipo de identificación</label>
                        <select id="tipo_identificacion_busqueda" name="tipo_identificacion_busqueda" value={tipoIdentificacionBusqueda} onChange={handleTipoIdentificacionBusquedaChange} required
                            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                            {TIPOS_IDENTIFICACION.map((tipo) => (
                                <option key={tipo.value} value={tipo.value}>{tipo.etiqueta}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label htmlFor="cedula_busqueda" className="text-xs font-medium text-foreground-soft uppercase tracking-wider block">{configIdentificacionBusqueda.etiquetaCorta}</label>
                        <input id="cedula_busqueda" name="cedula_busqueda" type="text" inputMode={configIdentificacionBusqueda.inputMode} value={cedulaBusqueda} onChange={handleCedulaBusquedaChange} required
                            pattern={configIdentificacionBusqueda.pattern} title={configIdentificacionBusqueda.title} placeholder={configIdentificacionBusqueda.placeholder}
                            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                        {errorCedulaBusqueda && <p className="text-xs text-danger">{errorCedulaBusqueda}</p>}
                    </div>
                </div>

                {notFound && (
                    <div role="alert" className="p-3 bg-danger-soft border border-danger/30 rounded-lg text-danger text-sm text-center font-medium space-y-2">
                        <p>No se encontró ningún encargado con esa identificación.</p>
                        <button type="button" onClick={onSuccess} className="underline font-semibold cursor-pointer">Volver</button>
                    </div>
                )}

                {errorBusqueda && (
                    <div role="alert" className="p-3 bg-danger-soft border border-danger/30 rounded-lg text-danger text-sm text-center font-medium">
                        {errorBusqueda}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loadingBusqueda}
                    className="w-full py-3 px-4 bg-primary hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                    {loadingBusqueda && <Loader2 size={18} className="animate-spin" />}
                    {loadingBusqueda ? 'Buscando...' : 'Buscar'}
                </button>
            </form>
        );
    }

    const agrupacionSeleccionada = agrupaciones.find((a) => a.id === idAgrupacionSeleccionada);

    return (
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <fieldset className="space-y-4">
                <legend className="text-lg font-semibold text-primary">Datos del encargado</legend>
                <div className="grid sm:grid-cols-2 gap-4">
                    <CampoSoloLectura etiqueta={obtenerConfigIdentificacion(encargadoOriginal.tipo_identificacion).etiquetaCorta} valor={encargadoOriginal.cedula} />
                    <CampoSoloLectura etiqueta="Nombre completo" valor={`${encargadoOriginal.primer_nombre} ${encargadoOriginal.apellido}`} />
                    <div className="space-y-1">
                        <label htmlFor="email" className="text-xs font-medium text-foreground-soft uppercase tracking-wider block">Correo electrónico</label>
                        <input id="email" name="email" type="email" value={valores.email} onChange={handleChange} required
                            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div className="space-y-1">
                        <label htmlFor="numero_tel" className="text-xs font-medium text-foreground-soft uppercase tracking-wider block">Número de teléfono</label>
                        <div className="flex gap-2">
                            {valores.codigo_pais_tel === 'OTRO' && (
                                <input id="prefijo_custom_tel" name="prefijo_custom_tel" type="text" inputMode="numeric" value={valores.prefijo_custom_tel} onChange={handlePrefijoCustomChange} required
                                    placeholder="Prefijo" maxLength={MAX_DIGITOS_PREFIJO_CUSTOM}
                                    className="w-20 px-2 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                            )}
                            <input id="numero_tel" name="numero_tel" type="tel" inputMode="numeric" value={valores.numero_tel} onChange={handleNumeroTelChange} required
                                pattern={configTelefono.pattern} title={configTelefono.title} maxLength={configTelefono.maxLength}
                                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                        </div>
                        {errores.numero_tel && <p className="text-xs text-danger">{errores.numero_tel}</p>}
                    </div>
                    <div className="space-y-1">
                        <label htmlFor="codigo_pais_tel" className="text-xs font-medium text-foreground-soft uppercase tracking-wider block">País</label>
                        <select id="codigo_pais_tel" name="codigo_pais_tel" value={valores.codigo_pais_tel} onChange={handleCodigoPaisChange} required
                            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                            {PAISES_TELEFONO.map((p) => (
                                <option key={p.value} value={p.value}>{p.pais}{p.prefijo ? ` (+${p.prefijo})` : ''}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </fieldset>

            <fieldset className="space-y-4">
                <legend className="text-lg font-semibold text-primary">Agrupación</legend>

                {agrupaciones.length > 0 && (
                    <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                        <div className="flex-1 space-y-1">
                            <label htmlFor="agrupacion_existente" className="text-xs font-medium text-foreground-soft uppercase tracking-wider block">Selecciona una de tus agrupaciones</label>
                            <select
                                id="agrupacion_existente"
                                value={idAgrupacionSeleccionada}
                                disabled={modoAgrupacion !== 'existente'}
                                onChange={(e) => setIdAgrupacionSeleccionada(Number(e.target.value))}
                                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                            >
                                {agrupaciones.map((a) => (
                                    <option key={a.id} value={a.id}>{a.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            type="button"
                            onClick={() => setModoAgrupacion(modoAgrupacion === 'existente' ? 'nueva' : 'existente')}
                            className="px-4 py-2 border border-primary text-primary hover:bg-primary hover:text-white rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap"
                        >
                            {modoAgrupacion === 'existente' ? 'Registrar una nueva agrupación' : 'Usar una agrupación existente'}
                        </button>
                    </div>
                )}

                {modoAgrupacion === 'existente' && agrupacionSeleccionada && (
                    <div className="grid sm:grid-cols-2 gap-4 p-4 rounded-lg border border-border bg-background">
                        <CampoSoloLectura etiqueta="Lugar de procedencia" valor={agrupacionSeleccionada.lugar_procedencia} />
                        <CampoSoloLectura etiqueta="Cantidad de integrantes" valor={agrupacionSeleccionada.cantidad_integrantes} />
                        <div className="sm:col-span-2">
                            <CampoArchivoAdjunto archivoAdjuntoUrl={agrupacionSeleccionada.archivo_adjunto_url} resena={agrupacionSeleccionada.resena} />
                        </div>
                    </div>
                )}

                {modoAgrupacion === 'nueva' && (
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label htmlFor="nombre" className="text-xs font-medium text-foreground-soft uppercase tracking-wider block">Nombre de la agrupación</label>
                            <input id="nombre" name="nombre" type="text" value={valores.nombre} onChange={handleChange} required
                                pattern="[A-Za-zÁÉÍÓÚÑÜáéíóúñü\s]+" title="Solo letras y espacios" minLength={2} maxLength={150}
                                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                            {errores.nombre && <p className="text-xs text-danger">{errores.nombre}</p>}
                        </div>
                        <div className="space-y-1">
                            <label htmlFor="lugar_procedencia" className="text-xs font-medium text-foreground-soft uppercase tracking-wider block">Lugar de procedencia</label>
                            <input id="lugar_procedencia" name="lugar_procedencia" type="text" value={valores.lugar_procedencia} onChange={handleChange} required
                                pattern="[A-Za-zÁÉÍÓÚÑÜáéíóúñü\s]+" title="Solo letras y espacios" minLength={2} maxLength={150}
                                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                            {errores.lugar_procedencia && <p className="text-xs text-danger">{errores.lugar_procedencia}</p>}
                        </div>
                        <div className="space-y-1">
                            <label htmlFor="cantidad_integrantes" className="text-xs font-medium text-foreground-soft uppercase tracking-wider block">Cantidad de integrantes</label>
                            <input id="cantidad_integrantes" name="cantidad_integrantes" type="number" min="1" max="200" step="1" value={valores.cantidad_integrantes} onChange={handleChange} required
                                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                        </div>
                        <div className="space-y-1 sm:col-span-2">
                            <label htmlFor="archivo_adjunto" className="text-xs font-medium text-foreground-soft uppercase tracking-wider block">Adjuntar archivo (presentaciones previas, portafolio, etc.)</label>
                            <input id="archivo_adjunto" name="archivo_adjunto" type="file" accept="image/png,image/jpeg,application/pdf" onChange={handleArchivoAdjuntoChange}
                                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-primary file:text-white file:cursor-pointer cursor-pointer" />
                            <p className="text-xs text-foreground-faint">Formatos permitidos: PNG, JPG o PDF. Tamaño máximo 4MB.</p>
                            {valores.archivo_adjunto_nombre && <p className="text-xs text-foreground-soft">Archivo seleccionado: {valores.archivo_adjunto_nombre}</p>}
                            {errores.archivo_adjunto && <p className="text-xs text-danger">{errores.archivo_adjunto}</p>}
                        </div>
                    </div>
                )}
            </fieldset>

            <fieldset className="space-y-4">
                <legend className="text-lg font-semibold text-primary">Datos de la solicitud</legend>
                <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label htmlFor="fecha_asignada" className="text-xs font-medium text-foreground-soft uppercase tracking-wider block">Fecha deseada de participación</label>
                        <input id="fecha_asignada" name="fecha_asignada" type="date" min={hoy} value={valores.fecha_asignada} onChange={handleChange} required
                            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div className="space-y-1">
                        <label htmlFor="hora_asignada" className="text-xs font-medium text-foreground-soft uppercase tracking-wider block">Hora deseada de participación</label>
                        <input id="hora_asignada" name="hora_asignada" type="time" value={valores.hora_asignada} onChange={handleChange} required
                            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                        <label htmlFor="comentarios" className="text-xs font-medium text-foreground-soft uppercase tracking-wider block">Comentarios (en caso de requerir algun beneficio)</label>
                        <textarea id="comentarios" name="comentarios" placeholder="Ej: Trasporte, Alojamiento, Mobiliario..." rows={4} value={valores.comentarios} onChange={handleChange} required
                            minLength={10} maxLength={1000}
                            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                </div>
            </fieldset>

            {error && (
                <div role="alert" className="p-3 bg-danger-soft border border-danger/30 rounded-lg text-danger text-sm text-center font-medium">
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-primary hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
                {loading && <Loader2 size={18} className="animate-spin" />}
                {loading ? 'Enviando...' : 'Enviar solicitud'}
            </button>
        </form>
    );
}
