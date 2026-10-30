import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import FormularioSolicitud from './FormularioSolicitud';
import { useAtraparFoco } from '../../../hooks/useAtraparFoco';
import { BOTON_CERRAR_MODAL_CLASS, MODAL_OVERLAY_CLASS, MODAL_PANEL_CLASS } from '../../../utils/modal';

export default function ModalSolicitud({ open, onClose }) {
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
                aria-labelledby="titulo-modal-solicitud"
                tabIndex={-1}
                onClick={(e) => e.stopPropagation()}
                className={`${MODAL_PANEL_CLASS} max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8`}
            >
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Cerrar"
                    className={BOTON_CERRAR_MODAL_CLASS}
                >
                    <X size={20} aria-hidden="true" />
                </button>
                <h3 id="titulo-modal-solicitud" className="text-2xl text-center font-semibold text-foreground mb-6 px-8">
                    Solicitud de participación de agrupación
                </h3>
                <FormularioSolicitud onSuccess={onClose} />
            </div>
        </div>
    );
}
