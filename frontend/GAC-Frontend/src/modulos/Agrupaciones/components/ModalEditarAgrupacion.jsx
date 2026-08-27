import { useEffect, useState } from 'react';
import { Loader2, X } from 'lucide-react';
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
        nombre: agrupacion.nombre ?? '',
        lugar_procedencia: agrupacion.lugar_procedencia ?? '',
        cantidad_integrantes: agrupacion.cantidad_integrantes ?? '',
        resena: agrupacion.resena ?? '',
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

        const result = await actualizarAgrupacion(agrupacion.id, valores);
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
                className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-surface rounded-2xl shadow-2xl p-8 relative"
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

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
                    <div className="space-y-1">
                        <label htmlFor="resena" className="text-xs font-medium text-foreground-soft uppercase tracking-wider block">Reseña</label>
                        <textarea id="resena" name="resena" rows={3} value={valores.resena} onChange={handleChange}
                            maxLength={5000}
                            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>

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
