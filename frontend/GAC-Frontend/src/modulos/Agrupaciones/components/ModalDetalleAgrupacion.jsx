import { useEffect } from 'react';
import { Users, X } from 'lucide-react';
import { obtenerConfigIdentificacion } from '../../../utils/identificacion';
import CampoArchivoAdjunto from '../../../components/CampoArchivoAdjunto';

function Campo({ etiqueta, valor }) {
    return (
        <div className="space-y-1">
            <p className="text-xs font-medium text-foreground-faint uppercase tracking-wider">{etiqueta}</p>
            <p className="text-sm text-foreground whitespace-pre-wrap">{valor || '—'}</p>
        </div>
    );
}

export default function ModalDetalleAgrupacion({ open, agrupacion, onClose }) {
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="titulo-modal-detalle-agrupacion"
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

                <div className="flex flex-col items-center gap-3 mb-6">
                    <div className="w-24 h-24 rounded-full bg-primary/10 border border-border overflow-hidden flex items-center justify-center">
                        {agrupacion.foto_url ? (
                            <img src={agrupacion.foto_url} alt={agrupacion.nombre} className="w-full h-full object-cover" />
                        ) : (
                            <Users size={32} className="text-primary/40" />
                        )}
                    </div>
                    <h3 id="titulo-modal-detalle-agrupacion" className="text-2xl text-center font-bold text-primary">
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
