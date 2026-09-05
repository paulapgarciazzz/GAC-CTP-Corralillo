import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function ModalPreguntaParticipacion({ open, onClose, onRespuesta }) {
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
                aria-labelledby="titulo-modal-pregunta-participacion"
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm bg-surface rounded-2xl shadow-2xl p-8 relative"
            >
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Cerrar"
                    className="absolute top-4 right-4 text-foreground-faint hover:text-foreground transition-colors cursor-pointer"
                >
                    <X size={22} />
                </button>
                <h3 id="titulo-modal-pregunta-participacion" className="text-xl text-center font-bold text-primary mb-6">
                    ¿Ya ha participado previamente?
                </h3>
                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={() => onRespuesta(false)}
                        className="flex-1 py-3 px-4 border border-primary text-primary hover:bg-primary hover:text-white font-semibold rounded-xl transition-all duration-200 cursor-pointer"
                    >
                        No
                    </button>
                    <button
                        type="button"
                        onClick={() => onRespuesta(true)}
                        className="flex-1 py-3 px-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl shadow-md transition-all duration-200 cursor-pointer"
                    >
                        Sí
                    </button>
                </div>
            </div>
        </div>
    );
}
