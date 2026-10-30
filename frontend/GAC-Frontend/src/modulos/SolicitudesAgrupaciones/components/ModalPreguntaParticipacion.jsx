import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useAtraparFoco } from '../../../hooks/useAtraparFoco';
import { BOTON_CERRAR_MODAL_CLASS, MODAL_OVERLAY_CLASS, MODAL_PANEL_CLASS } from '../../../utils/modal';

export default function ModalPreguntaParticipacion({ open, onClose, onRespuesta }) {
    const panelRef = useRef(null);
    useAtraparFoco(open, panelRef);

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
            className={MODAL_OVERLAY_CLASS}
            onClick={onClose}
        >
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="titulo-modal-pregunta-participacion"
                tabIndex={-1}
                onClick={(e) => e.stopPropagation()}
                className={`${MODAL_PANEL_CLASS} max-w-sm p-6 sm:p-8`}
            >
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Cerrar"
                    className={BOTON_CERRAR_MODAL_CLASS}
                >
                    <X size={20} aria-hidden="true" />
                </button>
                <h3 id="titulo-modal-pregunta-participacion" className="text-xl text-center font-semibold text-foreground mb-6 px-6">
                    ¿Ya ha participado previamente?
                </h3>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => onRespuesta(false)}
                        className="flex-1 min-h-11 py-2.5 px-4 border border-border-input bg-surface text-foreground hover:bg-surface-soft font-semibold rounded-lg transition-colors duration-150 cursor-pointer"
                    >
                        No
                    </button>
                    <button
                        type="button"
                        onClick={() => onRespuesta(true)}
                        className="flex-1 min-h-11 py-2.5 px-4 bg-primary hover:bg-primary-hover text-on-primary font-semibold rounded-lg shadow-sm transition-colors duration-150 cursor-pointer"
                    >
                        Sí
                    </button>
                </div>
            </div>
        </div>
    );
}
