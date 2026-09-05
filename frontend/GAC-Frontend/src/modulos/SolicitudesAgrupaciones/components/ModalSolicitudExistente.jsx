import { useEffect } from 'react';
import { X } from 'lucide-react';
import FormularioSolicitudExistente from './FormularioSolicitudExistente';

export default function ModalSolicitudExistente({ open, onClose }) {
    useEffect(() => {
        if (!open) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="titulo-modal-solicitud-existente"
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
                <h3 id="titulo-modal-solicitud-existente" className="text-2xl text-center font-bold text-primary mb-6">
                    Nueva solicitud para agrupación existente
                </h3>
                <FormularioSolicitudExistente onSuccess={onClose} />
            </div>
        </div>
    );
}
