import { useEffect } from 'react';
import { X } from 'lucide-react';
import FormularioEventoNuevo from './FormularioEventoNuevo';

export default function ModalCrearEvento({ open, evento, onClose, onCreate, onUpdate, onDelete }){
    useEffect(() => {
        if (!open) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    },[open, onClose]);
    if (!open) return null;

    const eventoId = evento?.id;

    const handleSubmit = async (datos) => {
        const resultado = evento ? await onUpdate(eventoId, datos) : await onCreate(datos);
        if (resultado?.success) onClose();
        return resultado;
    };

    const handleDelete = async () => {
        if (!evento) return { success: false };
        const resultado = await onDelete(eventoId);
        if (resultado?.success) onClose();
        return resultado;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="titulo-modal-crear-evento"
                onClick={(event) => event.stopPropagation()}
                className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-surface rounded-2xl shadow-2xl p-6 sm:p-8 relative"
            >
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Cerrar"
                    className="absolute top-4 right-4 text-foreground-faint hover:text-foreground transition-colors cursor-pointer"
                >
                    <X size={22} />
                </button>
                <h2 id="titulo-modal-crear-evento" className="text-xl sm:text-2xl text-center font-bold text-primary mb-6">
                    {evento ? 'Editar evento' : 'Crear evento'}
                </h2>
                <FormularioEventoNuevo
                    evento={evento}
                    onSubmit={handleSubmit}
                    onCancel={onClose}
                    onDelete={handleDelete}
                />
            </div>
        </div>
    );
}
