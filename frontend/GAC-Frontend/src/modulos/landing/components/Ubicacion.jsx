import { ExternalLink, MapPin } from 'lucide-react';
import { usePersonalizacion } from '../../Personalizacion/publico/usePersonalizacion';
import EncabezadoSeccion from './EncabezadoSeccion';

export default function Ubicacion() {
    const { contacto } = usePersonalizacion();
    // Texto que se busca en Google Maps (Personalización › Contacto).
    const DIRECCION = contacto.ubicacion_mapa || contacto.direccion;

    if (!DIRECCION) return null;

    return (
        <section id="ubicacion" aria-labelledby="titulo-ubicacion" className="scroll-mt-24 bg-surface py-16 sm:py-20">
            <div className="container mx-auto px-4">
                <EncabezadoSeccion id="titulo-ubicacion" etiqueta="Cómo llegar" titulo="Ubicación" className="mb-8" />
                <p className="mx-auto mb-10 flex max-w-2xl items-start justify-center gap-2 text-center text-foreground-soft">
                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                    {DIRECCION}
                </p>

                <div className="mx-auto aspect-video max-w-4xl overflow-hidden rounded-2xl border border-border shadow-sm">
                    <iframe
                        src={`https://www.google.com/maps?q=${encodeURIComponent(DIRECCION)}&output=embed`}
                        title="Ubicación del CTP de Corralillo"
                        className="h-full w-full"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    />
                </div>

                <div className="mt-6 text-center">
                    <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(DIRECCION)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border-input px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-surface-soft"
                    >
                        Abrir en Google Maps
                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                        <span className="sr-only">(se abre en una pestaña nueva)</span>
                    </a>
                </div>
            </div>
        </section>
    );
}
