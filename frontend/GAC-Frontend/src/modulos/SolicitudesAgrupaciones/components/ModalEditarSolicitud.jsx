import { useEffect, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { actualizarSolicitud } from '../services/solicitudService';

export default function ModalEditarSolicitud({ open, solicitud, onClose, onActualizado }) {
    if (!open || !solicitud) return null;

    return (
        <FormularioEdicion
            key={solicitud.id}
            solicitud={solicitud}
            onClose={onClose}
            onActualizado={onActualizado}
        />
    );
}

function FormularioEdicion({ solicitud, onClose, onActualizado }) {
    const [valores, setValores] = useState({
        // Encargado
        cedula: solicitud.encargado?.cedula ?? '',
        primer_nombre: solicitud.encargado?.primer_nombre ?? '',
        apellido: solicitud.encargado?.apellido ?? '',
        email: solicitud.encargado?.email ?? '',
        numero_tel: solicitud.encargado?.numero_tel ?? '',
        // Agrupacion
        nombre: solicitud.agrupacion?.nombre ?? '',
        lugar_procedencia: solicitud.agrupacion?.lugar_procedencia ?? '',
        cantidad_integrantes: solicitud.agrupacion?.cantidad_integrantes ?? '',
        resena: solicitud.agrupacion?.resena ?? '',
        // Solicitud
        fecha_asignada: solicitud.fecha_asignada ?? '',
        hora_asignada: solicitud.hora_asignada ?? '',
        comentarios: solicitud.comentarios ?? '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handleChange = (e) => {
        const { name, value } = e.target;
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
                nombre: valores.nombre,
                lugar_procedencia: valores.lugar_procedencia,
                cantidad_integrantes: valores.cantidad_integrantes,
                resena: valores.resena,
            },
            solicitud: {
                fecha_asignada: valores.fecha_asignada,
                hora_asignada: valores.hora_asignada,
                comentarios: valores.comentarios,
            },
        };

        const result = await actualizarSolicitud(solicitud.id, payload);
        setLoading(false);

        if (result.success) {
            onActualizado(result.data);
            onClose();
        } else {
            setError(result.error);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="titulo-modal-editar-solicitud"
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-surface rounded-2xl shadow-2xl p-8 relative"
            >
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Cerrar"
                    className="absolute top-4 right-4 text-foreground-faint hover:text-foreground transition-colors cursor-pointer"
                >
                    <X size={22} />
                </button>
                <h3 id="titulo-modal-editar-solicitud" className="text-2xl text-center font-bold text-primary mb-6">
                    Editar solicitud
                </h3>

                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                    <fieldset className="space-y-4">
                        <legend className="text-lg font-semibold text-primary">Datos del encargado</legend>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label htmlFor="cedula" className="text-xs font-medium text-foreground-soft uppercase tracking-wider block">Cédula</label>
                                <input id="cedula" name="cedula" type="text" inputMode="numeric" value={valores.cedula} onChange={handleChange} required
                                    pattern="\d{9}" title="Debe contener exactamente 9 dígitos"
                                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="primer_nombre" className="text-xs font-medium text-foreground-soft uppercase tracking-wider block">Nombre</label>
                                <input id="primer_nombre" name="primer_nombre" type="text" value={valores.primer_nombre} onChange={handleChange} required
                                    pattern="[A-Za-zÁÉÍÓÚÑÜáéíóúñü\s]+" title="Solo letras y espacios" minLength={2} maxLength={100}
                                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="apellido" className="text-xs font-medium text-foreground-soft uppercase tracking-wider block">Apellido</label>
                                <input id="apellido" name="apellido" type="text" value={valores.apellido} onChange={handleChange} required
                                    pattern="[A-Za-zÁÉÍÓÚÑÜáéíóúñü\s]+" title="Solo letras y espacios" minLength={2} maxLength={100}
                                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
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
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="lugar_procedencia" className="text-xs font-medium text-foreground-soft uppercase tracking-wider block">Lugar de procedencia</label>
                                <input id="lugar_procedencia" name="lugar_procedencia" type="text" value={valores.lugar_procedencia} onChange={handleChange} required
                                    pattern="[A-Za-zÁÉÍÓÚÑÜáéíóúñü\s]+" title="Solo letras y espacios" minLength={2} maxLength={150}
                                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="cantidad_integrantes" className="text-xs font-medium text-foreground-soft uppercase tracking-wider block">Cantidad de integrantes</label>
                                <input id="cantidad_integrantes" name="cantidad_integrantes" type="number" min="1" max="200" step="1" value={valores.cantidad_integrantes} onChange={handleChange} required
                                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                            </div>
                            <div className="space-y-1 sm:col-span-2">
                                <label htmlFor="resena" className="text-xs font-medium text-foreground-soft uppercase tracking-wider block">Reseña</label>
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
                                <input id="fecha_asignada" name="fecha_asignada" type="date" value={valores.fecha_asignada} onChange={handleChange} required
                                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="hora_asignada" className="text-xs font-medium text-foreground-soft uppercase tracking-wider block">Hora deseada de participación</label>
                                <input id="hora_asignada" name="hora_asignada" type="time" value={valores.hora_asignada} onChange={handleChange}
                                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                            </div>
                            <div className="space-y-1 sm:col-span-2">
                                <label htmlFor="comentarios" className="text-xs font-medium text-foreground-soft uppercase tracking-wider block">Comentarios</label>
                                <textarea id="comentarios" name="comentarios" rows={4} value={valores.comentarios} onChange={handleChange} required
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
                        {loading ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                </form>
            </div>
        </div>
    );
}
