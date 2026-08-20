import { useEffect } from 'react';
import { X } from 'lucide-react';
import FormularioSolicitud from './FormularioSolicitud';

export default function ModalSolicitud({ open, onClose }) {
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
                aria-labelledby="titulo-modal-solicitud"
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl p-8 relative"
            >
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Cerrar"
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                >
                    <X size={22} />
                </button>
                <h3 id="titulo-modal-solicitud" className="text-2xl text-center font-bold text-blue-950 mb-6">
                    Solicitud de participación de agrupación
                </h3>
                <FormularioSolicitud onSuccess={onClose} />
            </div>
        </div>
    );
}
