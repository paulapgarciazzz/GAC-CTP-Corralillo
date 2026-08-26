import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { crearSolicitud } from '../services/solicitudService';

const valoresIniciales = {
    // Encargado
    cedula: '',
    primer_nombre: '',
    apellido: '',
    email: '',
    numero_tel: '',
    // Agrupacion
    nombre: '',
    lugar_procedencia: '',
    cantidad_integrantes: '',
    resena: '',
    // Solicitud
    fecha_asignada: '',
    comentarios: '',
};

const hoy = new Date().toISOString().split('T')[0];

const CAMPOS_SOLO_NUMEROS = { cedula: 9, numero_tel: 8 };
const CAMPOS_SOLO_LETRAS = ['primer_nombre', 'apellido', 'nombre', 'lugar_procedencia'];
const REGEX_NO_NUMERO = /\D/;
const REGEX_NO_LETRA = /[^A-Za-zÁÉÍÓÚÑÜáéíóúñü\s]/;

export default function FormularioSolicitud({ onSuccess }) {
    const [valores, setValores] = useState(valoresIniciales);
    const [errores, setErrores] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name } = e.target;
        let { value } = e.target;
        let mensaje = '';

        if (name in CAMPOS_SOLO_NUMEROS) {
            if (REGEX_NO_NUMERO.test(value)) mensaje = 'Solo se permiten números';
            value = value.replace(/\D/g, '').slice(0, CAMPOS_SOLO_NUMEROS[name]);
        } else if (CAMPOS_SOLO_LETRAS.includes(name)) {
            if (REGEX_NO_LETRA.test(value)) mensaje = 'Solo se permiten letras y espacios';
            value = value.replace(/[^A-Za-zÁÉÍÓÚÑÜáéíóúñü\s]/g, '');
        }

        setErrores((prev) => ({ ...prev, [name]: mensaje }));
        setValores((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const payload = {
            encargado: {
                cedula: valores.cedula,
                primer_nombre: valores.primer_nombre,
                apellido: valores.apellido,
                email: valores.email,
                numero_tel: valores.numero_tel,
            },
            agrupacion: {
                ced_encargado: valores.cedula,
                nombre: valores.nombre,
                lugar_procedencia: valores.lugar_procedencia,
                cantidad_integrantes: valores.cantidad_integrantes,
                resena: valores.resena,
            },
            solicitud: {
                fecha_solicitud: new Date().toISOString().split('T')[0],
                fecha_asignada: valores.fecha_asignada,
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
                        <label htmlFor="cedula" className="text-xs font-medium text-foreground-soft uppercase tracking-wider block">Cédula</label>
                        <input id="cedula" name="cedula" type="text" inputMode="numeric" value={valores.cedula} onChange={handleChange} required
                            pattern="\d{9}" title="Debe contener exactamente 9 dígitos"
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
                        <label htmlFor="email" className="text-xs font-medium text-foreground-soft uppercase tracking-wider block">Correo electrónico</label>
                        <input id="email" name="email" type="email" value={valores.email} onChange={handleChange} required
                            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                        <label htmlFor="numero_tel" className="text-xs font-medium text-foreground-soft uppercase tracking-wider block">Número de teléfono</label>
                        <input id="numero_tel" name="numero_tel" type="tel" inputMode="numeric" value={valores.numero_tel} onChange={handleChange} required
                            pattern="\d{8}" title="Debe contener exactamente 8 dígitos"
                            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                        {errores.numero_tel && <p className="text-xs text-danger">{errores.numero_tel}</p>}
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
                        <label htmlFor="resena" className="text-xs font-medium text-foreground-soft uppercase tracking-wider block">Reseña (Presentaciones previas y que los caracteriza)</label>
                        <textarea id="resena" name="resena" rows={3} value={valores.resena} onChange={handleChange} required
                            minLength={10} maxLength={1000}
                            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
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
