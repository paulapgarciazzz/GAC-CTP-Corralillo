import { useEffect, useState } from 'react';
import { Loader2, Upload, Users, X } from 'lucide-react';
import { actualizarAgrupacion } from '../services/agrupacionService';

export default function ModalEditarAgrupacion({ open, agrupacion, onClose, onActualizado }) {
    if (!open || !agrupacion) return null;

    return (
        <FormularioEdicion
            key={agrupacion.id}
            agrupacion={agrupacion}
            onClose={onClose}
            onActualizado={onActualizado}
        />
    );
}

function FormularioEdicion({ agrupacion, onClose, onActualizado }) {
    const [valores, setValores] = useState({
        // Encargado
        cedula: agrupacion.encargado?.cedula ?? '',
        primer_nombre: agrupacion.encargado?.primer_nombre ?? '',
        apellido: agrupacion.encargado?.apellido ?? '',
        email: agrupacion.encargado?.email ?? '',
        numero_tel: agrupacion.encargado?.numero_tel ?? '',
        // Agrupacion
        nombre: agrupacion.nombre ?? '',
        lugar_procedencia: agrupacion.lugar_procedencia ?? '',
        cantidad_integrantes: agrupacion.cantidad_integrantes ?? '',
        resena: agrupacion.resena ?? '',
        foto_url: agrupacion.foto_url ?? null,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFotoChange = (e) => {
        const archivo = e.target.files?.[0];
        if (!archivo) return;

        if (!archivo.type.startsWith('image/')) {
            setError('El archivo seleccionado debe ser una imagen.');
            return;
        }

        setError('');
        const reader = new FileReader();
        reader.onload = () => {
            setValores((prev) => ({ ...prev, foto_url: reader.result }));
        };
        reader.readAsDataURL(archivo);
    };

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
            nombre: valores.nombre,
            lugar_procedencia: valores.lugar_procedencia,
            cantidad_integrantes: valores.cantidad_integrantes,
            resena: valores.resena,
            foto_url: valores.foto_url,
            encargado: {
                cedula: valores.cedula,
                primer_nombre: valores.primer_nombre,
                apellido: valores.apellido,
                email: valores.email,
                numero_tel: valores.numero_tel,
            },
        };

        const result = await actualizarAgrupacion(agrupacion.id, payload);
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
                aria-labelledby="titulo-modal-editar-agrupacion"
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
                <h3 id="titulo-modal-editar-agrupacion" className="text-2xl text-center font-bold text-primary mb-6">
                    Editar agrupación
                </h3>

                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-24 h-24 rounded-full bg-primary/10 border border-border overflow-hidden flex items-center justify-center">
                            {valores.foto_url ? (
                                <img src={valores.foto_url} alt={valores.nombre} className="w-full h-full object-cover" />
                            ) : (
                                <Users size={32} className="text-primary/40" />
                            )}
                        </div>
                        <label
                            htmlFor="foto"
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border border-primary text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                        >
                            <Upload size={14} />
                            Cambiar foto
                        </label>
                        <input id="foto" name="foto" type="file" accept="image/*" onChange={handleFotoChange} className="hidden" />
                    </div>

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
                                    minLength={2} maxLength={150}
                                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="lugar_procedencia" className="text-xs font-medium text-foreground-soft uppercase tracking-wider block">Lugar de procedencia</label>
                                <input id="lugar_procedencia" name="lugar_procedencia" type="text" value={valores.lugar_procedencia} onChange={handleChange} required
                                    minLength={2} maxLength={150}
                                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="cantidad_integrantes" className="text-xs font-medium text-foreground-soft uppercase tracking-wider block">Cantidad de integrantes</label>
                                <input id="cantidad_integrantes" name="cantidad_integrantes" type="number" min="1" max="200" step="1" value={valores.cantidad_integrantes} onChange={handleChange} required
                                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                            </div>
                            <div className="space-y-1 sm:col-span-2">
                                <label htmlFor="resena" className="text-xs font-medium text-foreground-soft uppercase tracking-wider block">Reseña</label>
                                <textarea id="resena" name="resena" rows={3} value={valores.resena} onChange={handleChange}
                                    maxLength={5000}
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
