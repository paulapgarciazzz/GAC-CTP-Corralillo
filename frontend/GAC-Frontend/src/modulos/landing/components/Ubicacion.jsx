import { MapPin } from 'lucide-react';

const DIRECCION = '6JFF+WH Corralillo High School, Guanacaste Province, Moracia de Nicoya';

export default function Ubicacion() {
    return (
        <section id="ubicacion" className="scroll-mt-24 bg-surface py-20">
            <div className="container mx-auto px-4">
                <div className="mx-auto mb-10 max-w-2xl text-center">
                    <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Ubicación</h2>
                    <p className="mt-3 flex items-center justify-center gap-2 text-foreground-soft">
                        <MapPin className="h-5 w-5 shrink-0 text-primary" />
                        {DIRECCION}
                    </p>
                </div>

                <div className="mx-auto aspect-video max-w-4xl overflow-hidden rounded-2xl border border-border shadow-md">
                    <iframe
                        src={`https://www.google.com/maps?q=${encodeURIComponent(DIRECCION)}&output=embed`}
                        title="Ubicación del CTP de Corralillo"
                        className="h-full w-full"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    />
                </div>

                <div className="mt-4 text-center">
                    <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(DIRECCION)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-semibold text-primary hover:underline"
                    >
                        Abrir en Google Maps
                    </a>
                </div>
            </div>
        </section>
    );
}
