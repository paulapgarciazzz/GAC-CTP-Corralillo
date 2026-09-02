import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { crearSolicitud } from '../services/solicitudService';
import { TIPOS_IDENTIFICACION, obtenerConfigIdentificacion, formatearValorIdentificacion } from '../../../utils/identificacion';
import { PAISES_TELEFONO, CODIGO_PAIS_POR_DEFECTO, MAX_DIGITOS_PREFIJO_CUSTOM, obtenerConfigTelefono, combinarNumeroTelefono } from '../../../utils/telefono';

const valoresIniciales = {
    // Encargado
    tipo_identificacion: 'cedula',
    cedula: '',
    primer_nombre: '',
    apellido: '',
    email: '',
    codigo_pais_tel: CODIGO_PAIS_POR_DEFECTO,
    prefijo_custom_tel: '',
    numero_tel: '',
    // Agrupacion
    nombre: '',
    lugar_procedencia: '',
    cantidad_integrantes: '',
    archivo_adjunto: null,
    archivo_adjunto_nombre: '',
    // Solicitud
    fecha_asignada: '',
    hora_asignada: '',
    comentarios: '',
};

const hoy = new Date().toISOString().split('T')[0];

const CAMPOS_SOLO_LETRAS = ['primer_nombre', 'apellido', 'nombre', 'lugar_procedencia'];
const REGEX_NO_LETRA = /[^A-Za-zÁÉÍÓÚÑÜáéíóúñü\s]/;

const TIPOS_ARCHIVO_ADJUNTO_ACEPTADOS = ['image/png', 'image/jpeg', 'application/pdf'];
const TAMANO_MAXIMO_ARCHIVO_ADJUNTO = 4 * 1024 * 1024;

export default function FormularioSolicitud({ onSuccess }) {
    const [valores, setValores] = useState(valoresIniciales);
    const [errores, setErrores] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const configIdentificacion = obtenerConfigIdentificacion(valores.tipo_identificacion);

    const configTelefono = obtenerConfigTelefono(valores.codigo_pais_tel);

    const handleChange = (e) => {
        const { name } = e.target;
        let { value } = e.target;
        let mensaje = '';

        if (name === 'cedula') {
            const regexInvalido = configIdentificacion.soloNumeros ? /\D/ : /[^A-Za-z0-9]/;
            if (regexInvalido.test(value)) mensaje = configIdentificacion.mensajeError;
            value = formatearValorIdentificacion(valores.tipo_identificacion, value);
        } else if (CAMPOS_SOLO_LETRAS.includes(name)) {
            if (REGEX_NO_LETRA.test(value)) mensaje = 'Solo se permiten letras y espacios';
            value = value.replace(/[^A-Za-zÁÉÍÓÚÑÜáéíóúñü\s]/g, '');
        }

        setErrores((prev) => ({ ...prev, [name]: mensaje }));
        setValores((prev) => ({ ...prev, [name]: value }));
    };

    const handleTipoIdentificacionChange = (e) => {
        const tipo_identificacion = e.target.value;
        setValores((prev) => ({ ...prev, tipo_identificacion, cedula: '' }));
        setErrores((prev) => ({ ...prev, cedula: '' }));
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

        if (!valores.archivo_adjunto) {
            setError('Debe adjuntar un archivo (PNG, JPG o PDF).');
            return;
        }

        setLoading(true);

        const payload = {
            encargado: {
                cedula: valores.cedula,
                tipo_identificacion: valores.tipo_identificacion,
                primer_nombre: valores.primer_nombre,
                apellido: valores.apellido,
                email: valores.email,
                numero_tel: combinarNumeroTelefono({
                    codigoPais: valores.codigo_pais_tel,
                    prefijoCustom: valores.prefijo_custom_tel,
                    numero: valores.numero_tel,
                }),
            },
            agrupacion: {
                ced_encargado: valores.cedula,
                nombre: valores.nombre,
                lugar_procedencia: valores.lugar_procedencia,
                cantidad_integrantes: valores.cantidad_integrantes,
                archivo_adjunto: valores.archivo_adjunto,
            },
            solicitud: {
                fecha_solicitud: new Date().toISOString().split('T')[0],
                fecha_asignada: valores.fecha_asignada,
                hora_asignada: valores.hora_asignada,
                comentarios: valores.comentarios,
            },
        };

        const result = await crearSolicitud(payload);
        setLoading(false);

        if (result.success) {
            setValores(valoresIniciales);
            onSuccess?.();
        } else {
            setError(result.error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <fieldset className="space-y-4">
                <legend className="text-lg font-semibold text-primary">Datos del encargado</legend>
                <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label htmlFor="tipo_identificacion" className="text-xs font-medium text-foreground-soft uppercase tracking-wider block">Tipo de identificación</label>
                        <select id="tipo_identificacion" name="tipo_identificacion" value={valores.tipo_identificacion} onChange={handleTipoIdentificacionChange} required
                            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                            {TIPOS_IDENTIFICACION.map((tipo) => (
                                <option key={tipo.value} value={tipo.value}>{tipo.etiqueta}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label htmlFor="cedula" className="text-xs font-medium text-foreground-soft uppercase tracking-wider block">{configIdentificacion.etiquetaCorta}</label>
                        <input id="cedula" name="cedula" type="text" inputMode={configIdentificacion.inputMode} value={valores.cedula} onChange={handleChange} required
                            pattern={configIdentificacion.pattern} title={configIdentificacion.title} placeholder={configIdentificacion.placeholder}
                            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                        {errores.cedula && <p className="text-xs text-danger">{errores.cedula}</p>}
                    </div>
                    <div className="space-y-1">
                        <label htmlFor="primer_nombre" className="text-xs font-medium text-foreground-soft uppercase tracking-wider block">Nombre</label>
                        <input id="primer_nombre" name="primer_nombre" type="text" value={valores.primer_nombre} onChange={handleChange} required
                            pattern="[A-Za-zÁÉÍÓÚÑÜáéíóúñü\s]+" title="Solo letras y espacios" minLength={2} maxLength={100}
                            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                        {errores.primer_nombre && <p className="text-xs text-danger">{errores.primer_nombre}</p>}
                    </div>
                    <div className="space-y-1">
                        <label htmlFor="apellido" className="text-xs font-medium text-foreground-soft uppercase tracking-wider block">Apellido</label>
                        <input id="apellido" name="apellido" type="text" value={valores.apellido} onChange={handleChange} required
                            pattern="[A-Za-zÁÉÍÓÚÑÜáéíóúñü\s]+" title="Solo letras y espacios" minLength={2} maxLength={100}
                            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                        {errores.apellido && <p className="text-xs text-danger">{errores.apellido}</p>}
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
                        <label htmlFor="email" className="text-xs font-medium text-foreground-soft uppercase tracking-wider block">Correo electrónico</label>
                        <input id="email" name="email" type="email" value={valores.email} onChange={handleChange} required
                            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                </div>
            </fieldset>

            <fieldset className="space-y-4">
                <legend className="text-lg font-semibold text-primary">Datos de la agrupación</legend>
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
                        <input id="archivo_adjunto" name="archivo_adjunto" type="file" accept="image/png,image/jpeg,application/pdf" onChange={handleArchivoAdjuntoChange} required
                            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-primary file:text-white file:cursor-pointer cursor-pointer" />
                        <p className="text-xs text-foreground-faint">Formatos permitidos: PNG, JPG o PDF. Tamaño máximo 4MB.</p>
                        {valores.archivo_adjunto_nombre && <p className="text-xs text-foreground-soft">Archivo seleccionado: {valores.archivo_adjunto_nombre}</p>}
                        {errores.archivo_adjunto && <p className="text-xs text-danger">{errores.archivo_adjunto}</p>}
                    </div>
                </div>
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
