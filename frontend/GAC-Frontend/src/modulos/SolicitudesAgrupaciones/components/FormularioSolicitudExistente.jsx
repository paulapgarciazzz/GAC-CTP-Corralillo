import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { buscarEncargadoPorCedula, obtenerAgrupacionesPorEncargado, actualizarEncargado } from '../services/encargadoService';
import { actualizarAgrupacion } from '../../../modulos/Agrupaciones/services/agrupacionService';
import { crearSolicitudParaEncargadoExistente } from '../services/solicitudService';
import { formatearValorIdentificacion, obtenerConfigIdentificacion } from '../../../utils/identificacion';
import { PAISES_TELEFONO, CODIGO_PAIS_POR_DEFECTO, MAX_DIGITOS_PREFIJO_CUSTOM, obtenerConfigTelefono, combinarNumeroTelefono, parsearNumeroTelefono } from '../../../utils/telefono';
import { obtenerFechaLocalISO } from '../../../utils/fecha';
import CampoArchivoAdjunto from '../../../components/CampoArchivoAdjunto';

const hoy = obtenerFechaLocalISO();
const TIPOS_ARCHIVO_ADJUNTO_ACEPTADOS = ['image/png', 'image/jpeg', 'application/pdf'];
const TAMANO_MAXIMO_ARCHIVO_ADJUNTO = 4 * 1024 * 1024;
const CAMPOS_SOLO_LETRAS = ['primer_nombre', 'apellido', 'nombre', 'lugar_procedencia'];
const REGEX_NO_LETRA = /[^A-Za-zÁÉÍÓÚÑÜáéíóúñü\s]/;

const valoresIniciales = {
    primer_nombre: '', apellido: '', email: '', codigo_pais_tel: CODIGO_PAIS_POR_DEFECTO,
    prefijo_custom_tel: '', numero_tel: '', nombre: '', lugar_procedencia: '', cantidad_integrantes: '',
    archivo_adjunto: null, archivo_adjunto_nombre: '', resena: '', fecha_solicitada: '', hora_solicitada: '', comentarios: '',
};

function CampoSoloLectura({ etiqueta, valor }) {
    return <div className="space-y-1"><p className="text-xs font-medium text-foreground-soft uppercase tracking-wider">{etiqueta}</p><p className="text-sm text-foreground px-4 py-2 border border-border rounded-lg bg-background">{valor || '—'}</p></div>;
}

function BotonContinuar({ loading, children = 'Continuar' }) {
    return <button type="submit" disabled={loading} className="w-full py-3 px-4 bg-primary hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer">{loading && <Loader2 size={18} className="animate-spin" />}{loading ? 'Guardando...' : children}</button>;
}

export default function FormularioSolicitudExistente({ onSuccess }) {
    const [paso, setPaso] = useState('buscar');
    const [cedulaBusqueda, setCedulaBusqueda] = useState('');
    const [encargado, setEncargado] = useState(null);
    const [encargadoOriginal, setEncargadoOriginal] = useState(null);
    const [agrupaciones, setAgrupaciones] = useState([]);
    const [agrupacionSeleccionada, setAgrupacionSeleccionada] = useState(null);
    const [modoAgrupacion, setModoAgrupacion] = useState('existente');
    const [valores, setValores] = useState(valoresIniciales);
    const [errores, setErrores] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const configTelefono = obtenerConfigTelefono(valores.codigo_pais_tel);

    const handleBuscar = async (event) => {
        event.preventDefault();
        const cedula = cedulaBusqueda.trim();
        setError('');
        if (!cedula) { setError('Ingresa una cédula para realizar la búsqueda.'); return; }
        setLoading(true);
        const resultado = await buscarEncargadoPorCedula(cedula);
        setLoading(false);
        if (resultado.notFound) { setError('No se encontró un encargado registrado con esta cédula.'); return; }
        if (!resultado.success) { setError(resultado.error); return; }

        const datos = resultado.data;
        if (!datos || typeof datos !== 'object' || !String(datos.cedula ?? '').trim()) {
            setError('La respuesta del encargado no contiene una cédula válida. Intenta de nuevo.');
            return;
        }
        const telefono = parsearNumeroTelefono(datos.numero_tel);
        setEncargado(datos);
        setEncargadoOriginal(datos);
        setValores((prev) => ({ ...prev, primer_nombre: datos.primer_nombre ?? '', apellido: datos.apellido ?? '', email: datos.email ?? '', codigo_pais_tel: telefono.codigoPais, prefijo_custom_tel: telefono.prefijoCustom, numero_tel: telefono.numero }));
        setPaso('encargado');
    };

    const handleChange = (event) => {
        const { name } = event.target;
        let { value } = event.target;
        let mensaje = '';
        if (CAMPOS_SOLO_LETRAS.includes(name)) {
            if (REGEX_NO_LETRA.test(value)) mensaje = 'Solo se permiten letras y espacios.';
            value = value.replace(/[^A-Za-zÁÉÍÓÚÑÜáéíóúñü\s]/g, '');
        }
        setErrores((prev) => ({ ...prev, [name]: mensaje }));
        setError('');
        setValores((prev) => ({ ...prev, [name]: value }));
    };

    const handleCodigoPaisChange = (event) => setValores((prev) => ({ ...prev, codigo_pais_tel: event.target.value, numero_tel: '', prefijo_custom_tel: '' }));
    const handlePrefijoCustomChange = (event) => setValores((prev) => ({ ...prev, prefijo_custom_tel: event.target.value.replace(/\D/g, '').slice(0, MAX_DIGITOS_PREFIJO_CUSTOM) }));
    const handleNumeroTelChange = (event) => setValores((prev) => ({ ...prev, numero_tel: event.target.value.replace(/\D/g, '').slice(0, configTelefono.maxLength) }));

    const handleArchivoAdjuntoChange = (event) => {
        const archivo = event.target.files?.[0];
        if (!archivo) return;
        if (!TIPOS_ARCHIVO_ADJUNTO_ACEPTADOS.includes(archivo.type)) { setErrores((prev) => ({ ...prev, archivo_adjunto: 'Debe ser una imagen PNG/JPG o un PDF.' })); return; }
        if (archivo.size > TAMANO_MAXIMO_ARCHIVO_ADJUNTO) { setErrores((prev) => ({ ...prev, archivo_adjunto: 'El archivo no debe superar 4MB.' })); return; }
        setErrores((prev) => ({ ...prev, archivo_adjunto: '' }));
        const reader = new FileReader();
        reader.onload = () => setValores((prev) => ({ ...prev, archivo_adjunto: reader.result, archivo_adjunto_nombre: archivo.name }));
        reader.readAsDataURL(archivo);
    };

    const guardarEncargado = async (event) => {
        event.preventDefault();
        if (!encargado || !encargadoOriginal) return;
        setError('');
        setLoading(true);
        const numeroTel = combinarNumeroTelefono({ codigoPais: valores.codigo_pais_tel, prefijoCustom: valores.prefijo_custom_tel, numero: valores.numero_tel });
        const payload = {};
        ['primer_nombre', 'apellido', 'email'].forEach((campo) => { if (valores[campo] !== (encargadoOriginal[campo] ?? '')) payload[campo] = valores[campo]; });
        if (numeroTel !== (encargadoOriginal.numero_tel ?? '')) payload.numero_tel = numeroTel;
        if (Object.keys(payload).length > 0) {
            const resultado = await actualizarEncargado(encargado.cedula, payload);
            if (!resultado.success) { setLoading(false); setError(resultado.error); return; }
            const actualizado = resultado.data ?? { ...encargado, ...payload };
            setEncargado(actualizado);
            setEncargadoOriginal(actualizado);
        }
        const agrupacionesResultado = await obtenerAgrupacionesPorEncargado(encargado.cedula);
        setLoading(false);
        if (!agrupacionesResultado.success) { setError(agrupacionesResultado.error); return; }
        setAgrupaciones(agrupacionesResultado.data);
        setPaso('elegir-agrupacion');
    };

    const seleccionarAgrupacion = (agrupacion) => {
        setAgrupacionSeleccionada(agrupacion);
        setModoAgrupacion('existente');
        setValores((prev) => ({ ...prev, nombre: agrupacion.nombre ?? '', lugar_procedencia: agrupacion.lugar_procedencia ?? '', cantidad_integrantes: agrupacion.cantidad_integrantes ?? '', resena: agrupacion.resena ?? '', archivo_adjunto: null, archivo_adjunto_nombre: '' }));
        setError('');
        setPaso('agrupacion');
    };

    const elegirNuevaAgrupacion = () => {
        setAgrupacionSeleccionada(null);
        setModoAgrupacion('nueva');
        setValores((prev) => ({ ...prev, nombre: '', lugar_procedencia: '', cantidad_integrantes: '', resena: '', archivo_adjunto: null, archivo_adjunto_nombre: '' }));
        setError('');
        setPaso('agrupacion');
    };

    const guardarAgrupacion = async (event) => {
        event.preventDefault();
        if (!encargado) return;
        setError('');
        setLoading(true);
        let agrupacion = agrupacionSeleccionada;
        if (modoAgrupacion === 'existente' && agrupacion) {
            const cambios = {};
            ['lugar_procedencia', 'cantidad_integrantes', 'resena'].forEach((campo) => { if (valores[campo] !== (agrupacion[campo] ?? '')) cambios[campo] = valores[campo]; });
            if (Object.keys(cambios).length > 0) {
                const resultado = await actualizarAgrupacion(agrupacion.id, cambios);
                if (!resultado.success) { setLoading(false); setError(resultado.error); return; }
                agrupacion = resultado.data ?? { ...agrupacion, ...cambios };
            }
        }
        setAgrupacionSeleccionada(agrupacion);
        setLoading(false);
        setPaso('solicitud');
    };

    const crearSolicitud = async (event) => {
        event.preventDefault();
        if (!encargado || (modoAgrupacion === 'existente' && !agrupacionSeleccionada?.id)) return;
        setError('');
        setLoading(true);
        const resultado = await crearSolicitudParaEncargadoExistente({
            cedula: encargado.cedula,
            modoAgrupacion,
            idAgrupacionSeleccionada: agrupacionSeleccionada?.id,
            agrupacion: modoAgrupacion === 'nueva' ? {
                nombre: valores.nombre,
                lugar_procedencia: valores.lugar_procedencia,
                cantidad_integrantes: valores.cantidad_integrantes,
                archivo_adjunto: valores.archivo_adjunto,
                resena: valores.resena,
            } : undefined,
            solicitud: {
                fecha_solicitada: valores.fecha_solicitada,
                hora_solicitada: valores.hora_solicitada,
                comentarios: valores.comentarios,
            },
        });
        setLoading(false);
        if (resultado.success) onSuccess?.();
        else setError(resultado.error);
    };

    if (paso === 'buscar') return (
        <form onSubmit={handleBuscar} className="space-y-6" noValidate>
            <p className="text-sm text-foreground-soft text-center">Ingresa la cédula del encargado para recuperar sus datos.</p>
            <div className="space-y-1"><label htmlFor="cedula_busqueda" className="text-xs font-medium text-foreground-soft uppercase tracking-wider block">Cédula</label><input id="cedula_busqueda" name="cedula_busqueda" type="text" inputMode="numeric" value={cedulaBusqueda} onChange={(event) => { setCedulaBusqueda(formatearValorIdentificacion('cedula', event.target.value)); setError(''); }} required pattern="\d{9}" title="Debe contener exactamente 9 dígitos" placeholder="Ej: 123456789" className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" /></div>
            {error && <div role="alert" className="p-3 bg-danger-soft border border-danger/30 rounded-lg text-danger text-sm text-center font-medium">{error}</div>}
            <BotonContinuar loading={loading}>Buscar encargado</BotonContinuar>
        </form>
    );

    if (!encargado) return (
        <form onSubmit={handleBuscar} className="space-y-6" noValidate>
            <p className="text-sm text-foreground-soft text-center">Ingresa la cédula del encargado para recuperar sus datos.</p>
            <div className="space-y-1"><label htmlFor="cedula_busqueda" className="text-xs font-medium text-foreground-soft uppercase tracking-wider block">Cédula</label><input id="cedula_busqueda" name="cedula_busqueda" type="text" inputMode="numeric" value={cedulaBusqueda} onChange={(event) => { setCedulaBusqueda(formatearValorIdentificacion('cedula', event.target.value)); setError(''); }} required pattern="\d{9}" title="Debe contener exactamente 9 dígitos" placeholder="Ej: 123456789" className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" /></div>
            {error && <div role="alert" className="p-3 bg-danger-soft border border-danger/30 rounded-lg text-danger text-sm text-center font-medium">{error}</div>}
            <BotonContinuar loading={loading}>Buscar encargado</BotonContinuar>
        </form>
    );

    if (paso === 'encargado') {
        const configIdentificacion = obtenerConfigIdentificacion(encargado.tipo_identificacion);
        return <form onSubmit={guardarEncargado} className="space-y-6" noValidate><fieldset className="space-y-4"><legend className="text-lg font-semibold text-primary">Datos del encargado</legend><div className="grid sm:grid-cols-2 gap-4"><CampoSoloLectura etiqueta={configIdentificacion.etiquetaCorta} valor={encargado.cedula} />{['primer_nombre', 'apellido', 'email'].map((campo) => <div key={campo} className="space-y-1"><label htmlFor={campo} className="text-xs font-medium text-foreground-soft uppercase tracking-wider block">{campo === 'primer_nombre' ? 'Nombre' : campo === 'apellido' ? 'Apellido' : 'Correo electrónico'}</label><input id={campo} name={campo} type={campo === 'email' ? 'email' : 'text'} value={valores[campo]} onChange={handleChange} required className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />{errores[campo] && <p className="text-xs text-danger">{errores[campo]}</p>}</div>)}<div className="space-y-1"><label htmlFor="codigo_pais_tel" className="text-xs font-medium text-foreground-soft uppercase tracking-wider block">País</label><select id="codigo_pais_tel" value={valores.codigo_pais_tel} onChange={handleCodigoPaisChange} className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">{PAISES_TELEFONO.map((pais) => <option key={pais.value} value={pais.value}>{pais.pais}{pais.prefijo ? ` (+${pais.prefijo})` : ''}</option>)}</select></div><div className="space-y-1"><label htmlFor="numero_tel" className="text-xs font-medium text-foreground-soft uppercase tracking-wider block">Número de teléfono</label><div className="flex gap-2">{valores.codigo_pais_tel === 'OTRO' && <input id="prefijo_custom_tel" value={valores.prefijo_custom_tel} onChange={handlePrefijoCustomChange} inputMode="numeric" placeholder="Prefijo" maxLength={MAX_DIGITOS_PREFIJO_CUSTOM} className="w-20 px-2 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />}<input id="numero_tel" value={valores.numero_tel} onChange={handleNumeroTelChange} type="tel" inputMode="numeric" required pattern={configTelefono.pattern} title={configTelefono.title} className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" /></div></div></div></fieldset>{error && <div role="alert" className="p-3 bg-danger-soft border border-danger/30 rounded-lg text-danger text-sm text-center font-medium">{error}</div>}<BotonContinuar loading={loading}>Continuar a agrupaciones</BotonContinuar></form>;
    }

    if (paso === 'elegir-agrupacion') return <div className="space-y-6"><h4 className="text-lg font-semibold text-primary">¿Qué desea hacer?</h4>{agrupaciones.length > 0 ? <div className="space-y-3"><p className="text-sm text-foreground-soft">Selecciona una agrupación registrada:</p>{agrupaciones.map((agrupacion) => <button key={agrupacion.id} type="button" onClick={() => seleccionarAgrupacion(agrupacion)} className="w-full text-left p-4 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer"><span className="font-semibold text-foreground">{agrupacion.nombre}</span><span className="block text-sm text-foreground-soft">{agrupacion.lugar_procedencia || 'Sin lugar'} · {agrupacion.cantidad_integrantes || '—'} integrantes</span></button>)}</div> : <p className="p-3 bg-background border border-border rounded-lg text-sm text-foreground-soft">No hay agrupaciones registradas para este encargado.</p>}<button type="button" onClick={elegirNuevaAgrupacion} className="w-full py-3 px-4 border border-primary text-primary hover:bg-primary hover:text-white font-semibold rounded-xl transition-colors cursor-pointer">Registrar una agrupación nueva</button>{error && <div role="alert" className="p-3 bg-danger-soft border border-danger/30 rounded-lg text-danger text-sm text-center font-medium">{error}</div>}</div>;

    if (paso === 'agrupacion') return <form onSubmit={guardarAgrupacion} className="space-y-6" noValidate><fieldset className="space-y-4"><legend className="text-lg font-semibold text-primary">{modoAgrupacion === 'nueva' ? 'Registrar agrupación nueva' : 'Editar agrupación'}</legend><div className="grid sm:grid-cols-2 gap-4"><div className="space-y-1"><label htmlFor="nombre" className="text-xs font-medium text-foreground-soft uppercase tracking-wider block">Nombre de la agrupación</label><input id="nombre" name="nombre" value={valores.nombre} onChange={handleChange} required readOnly={modoAgrupacion === 'existente'} className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary read-only:bg-surface-soft read-only:text-foreground-faint" /></div><div className="space-y-1"><label htmlFor="lugar_procedencia" className="text-xs font-medium text-foreground-soft uppercase tracking-wider block">Lugar de procedencia</label><input id="lugar_procedencia" name="lugar_procedencia" value={valores.lugar_procedencia} onChange={handleChange} required className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" /></div><div className="space-y-1"><label htmlFor="cantidad_integrantes" className="text-xs font-medium text-foreground-soft uppercase tracking-wider block">Cantidad de integrantes</label><input id="cantidad_integrantes" name="cantidad_integrantes" type="number" min="1" max="200" value={valores.cantidad_integrantes} onChange={handleChange} required className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" /></div><div className="space-y-1 sm:col-span-2"><label htmlFor="resena" className="text-xs font-medium text-foreground-soft uppercase tracking-wider block">Reseña</label><textarea id="resena" name="resena" value={valores.resena} onChange={handleChange} rows={4} maxLength={5000} className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" /></div>{modoAgrupacion === 'nueva' && <div className="space-y-1 sm:col-span-2"><label htmlFor="archivo_adjunto" className="text-xs font-medium text-foreground-soft uppercase tracking-wider block">Adjuntar archivo</label><input id="archivo_adjunto" type="file" accept="image/png,image/jpeg,application/pdf" onChange={handleArchivoAdjuntoChange} className="w-full px-4 py-2 border border-border rounded-lg file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-primary file:text-white cursor-pointer" />{valores.archivo_adjunto_nombre && <p className="text-xs text-foreground-soft">Archivo seleccionado: {valores.archivo_adjunto_nombre}</p>}</div>}{modoAgrupacion === 'existente' && agrupacionSeleccionada && <div className="sm:col-span-2"><CampoArchivoAdjunto archivoAdjuntoUrl={agrupacionSeleccionada.archivo_adjunto_url} resena={agrupacionSeleccionada.resena} /></div>}</div></fieldset>{error && <div role="alert" className="p-3 bg-danger-soft border border-danger/30 rounded-lg text-danger text-sm text-center font-medium">{error}</div>}<BotonContinuar loading={loading}>{modoAgrupacion === 'nueva' ? 'Registrar y continuar' : 'Guardar y continuar'}</BotonContinuar></form>;

    if (paso === 'solicitud' && (modoAgrupacion === 'nueva' || agrupacionSeleccionada?.id)) return <form onSubmit={crearSolicitud} className="space-y-6" noValidate><fieldset className="space-y-4"><legend className="text-lg font-semibold text-primary">Datos de la solicitud</legend><div className="grid sm:grid-cols-2 gap-4"><div className="space-y-1"><label htmlFor="fecha_solicitada" className="text-xs font-medium text-foreground-soft uppercase tracking-wider block">Fecha deseada de participación</label><input id="fecha_solicitada" name="fecha_solicitada" type="date" min={hoy} value={valores.fecha_solicitada} onChange={handleChange} required className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" /></div><div className="space-y-1"><label htmlFor="hora_solicitada" className="text-xs font-medium text-foreground-soft uppercase tracking-wider block">Hora deseada de participación</label><input id="hora_solicitada" name="hora_solicitada" type="time" value={valores.hora_solicitada} onChange={handleChange} required className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" /></div><div className="space-y-1 sm:col-span-2"><label htmlFor="comentarios" className="text-xs font-medium text-foreground-soft uppercase tracking-wider block">Comentarios</label><textarea id="comentarios" name="comentarios" value={valores.comentarios} onChange={handleChange} rows={4} minLength={10} maxLength={1000} required className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" /></div></div></fieldset>{error && <div role="alert" className="p-3 bg-danger-soft border border-danger/30 rounded-lg text-danger text-sm text-center font-medium">{error}</div>}<BotonContinuar loading={loading}>Enviar solicitud</BotonContinuar></form>;

    return null;
}