import { useEffect, useRef } from 'react';
import { Users, X } from 'lucide-react';
import { obtenerConfigIdentificacion } from '../../../utils/identificacion';
import CampoArchivoAdjunto from '../../../components/CampoArchivoAdjunto';
import { useAtraparFoco } from '../../../hooks/useAtraparFoco';
import { BOTON_CERRAR_MODAL_CLASS, MODAL_OVERLAY_CLASS, MODAL_PANEL_CLASS } from '../../../utils/modal';

function Campo({ etiqueta, valor }) {
    return (
        <div className="space-y-1">
            <p className="text-xs font-medium text-foreground-faint uppercase tracking-wide">{etiqueta}</p>
            <p className="text-sm text-foreground whitespace-pre-wrap">{valor || '—'}</p>
        </div>
    );
}

export default function ModalDetalleAgrupacion({ open, agrupacion, onClose }) {
    const panelRef = useRef(null);
    useAtraparFoco(open && !!agrupacion, panelRef);

    useEffect(() => {
        if (!open) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [open, onClose]);

    if (!open || !agrupacion) return null;

    const encargado = agrupacion.encargado;

    return (
        <div
            className={MODAL_OVERLAY_CLASS}
            onClick={onClose}
        >
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="titulo-modal-detalle-agrupacion"
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

                <div className="flex flex-col items-center gap-3 mb-6">
                    <div className="w-24 h-24 rounded-full bg-surface-soft border border-border overflow-hidden flex items-center justify-center">
                        {agrupacion.foto_url ? (
                            <img src={agrupacion.foto_url} alt={agrupacion.nombre} className="w-full h-full object-cover" />
                        ) : (
                            <Users size={32} className="text-foreground-faint" aria-hidden="true" />
                        )}
                    </div>
                    <h3 id="titulo-modal-detalle-agrupacion" className="text-2xl text-center font-semibold text-foreground">
                        {agrupacion.nombre}
                    </h3>
                </div>

                <div className="space-y-6">
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-primary uppercase tracking-wider">Datos de la agrupación</h4>
                        <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
                            <Campo etiqueta="Nombre de la agrupación" valor={agrupacion.nombre} />
                            <Campo etiqueta="Lugar de procedencia" valor={agrupacion.lugar_procedencia} />
                            <Campo etiqueta="Cantidad de integrantes" valor={agrupacion.cantidad_integrantes} />
                            <div className="col-span-full">
                                <CampoArchivoAdjunto archivoAdjuntoUrl={agrupacion.archivo_adjunto_url} resena={agrupacion.resena} />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-primary uppercase tracking-wider">Datos del encargado</h4>
                        {encargado ? (
                            <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
                                <Campo etiqueta={obtenerConfigIdentificacion(encargado.tipo_identificacion).etiquetaCorta} valor={encargado.cedula} />
                                <Campo etiqueta="Nombre completo" valor={`${encargado.primer_nombre} ${encargado.apellido}`} />
                                <Campo etiqueta="Correo electrónico" valor={encargado.email} />
                                <Campo etiqueta="Número de teléfono" valor={encargado.numero_tel} />
                            </div>
                        ) : (
                            <p className="text-sm text-foreground-faint">Sin encargado registrado.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
