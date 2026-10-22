import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import escudoOriginal from '../../../assets/escudo.png';
import { usePersonalizacion } from '../../Personalizacion/publico/usePersonalizacion';
import { FOTOS_HERO_PREDETERMINADAS } from '../../Personalizacion/publico/predeterminados';

// Fotos del carrusel: las subidas en Personalización › Landing o, si no hay
// ninguna activa, las fotos originales. Cuando exista un video institucional,
// basta con reemplazar este bloque de fondo por un <video> — el resto del
// layout (texto, escudo, overlay) no depende de que el fondo sea una imagen.
export default function Hero() {
    const { landing, apariencia, fotos_hero } = usePersonalizacion();
    const FOTOS = fotos_hero.length > 0 ? fotos_hero.map((foto) => foto.url) : FOTOS_HERO_PREDETERMINADAS;
    const [indiceGuardado, setIndice] = useState(0);
    // Si cambia la cantidad de fotos, el índice se mantiene dentro del rango.
    const indice = indiceGuardado % FOTOS.length;

    useEffect(() => {
        if (FOTOS.length < 2) return undefined;
        const intervalo = setInterval(() => {
            setIndice((prev) => (prev + 1) % FOTOS.length);
        }, 5000);
        return () => clearInterval(intervalo);
    }, [FOTOS.length]);

    const anterior = () => setIndice((indice - 1 + FOTOS.length) % FOTOS.length);
    const siguiente = () => setIndice((indice + 1) % FOTOS.length);

    return (
        <section id="inicio" className="relative overflow-hidden bg-rail text-white">
            <div className="absolute inset-0">
                {FOTOS.map((src, i) => (
                    <img
                        key={src}
                        src={src}
                        alt=""
                        aria-hidden="true"
                        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${i === indice ? 'opacity-100' : 'opacity-0'}`}
                    />
                ))}
                <div className="absolute inset-0 bg-gradient-to-r from-rail/95 via-rail/85 to-rail/50" />
            </div>

            <div className="relative container mx-auto grid gap-6 px-4 pt-24 pb-6 sm:gap-8 sm:pt-28 sm:pb-8 lg:grid-cols-[1.3fr_1fr] lg:items-center lg:pt-32 lg:pb-10">
                <div className="space-y-3 text-center lg:text-left">
                    {landing.hero_etiqueta && (
                        <span className="inline-block rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-medium uppercase tracking-wide sm:text-sm">
                            {landing.hero_etiqueta}
                        </span>
                    )}
                    <h1 className="text-2xl font-bold leading-tight sm:text-3xl md:text-4xl">
                        {landing.hero_titulo}
                    </h1>
                    {landing.hero_descripcion && (
                        <p className="mx-auto max-w-xl text-sm text-white/80 sm:text-base lg:mx-0">
                            {landing.hero_descripcion}
                        </p>
                    )}
                </div>

                <div className="relative flex h-48 items-center justify-center overflow-visible sm:h-64 lg:h-72 lg:justify-end">
                    {/* Arco/semicírculo que entra desde el borde derecho del Hero, con el
                        escudo montado encima (en vez de círculos/glows simétricos alrededor). */}
                    <div className="absolute right-[-30%] top-1/2 h-48 w-48 -translate-y-1/2 rounded-full bg-linear-to-br from-primary/50 via-primary/30 to-accent/30 sm:h-72 sm:w-72 lg:right-[-18%] lg:h-88 lg:w-88" />
                    <div className="absolute right-[-26%] top-1/2 h-40 w-40 -translate-y-1/2 rounded-full border border-white/20 sm:h-60 sm:w-60 lg:right-[-14%] lg:h-72 lg:w-72" />
                    <img
                        src={apariencia.escudo_url || escudoOriginal}
                        alt="Escudo oficial del CTP de Corralillo"
                        className="relative z-10 h-24 w-24 object-contain drop-shadow-2xl sm:h-32 sm:w-32 lg:h-36 lg:w-36 lg:mr-8"
                    />
                </div>
            </div>

            {FOTOS.length > 1 && <div className="relative flex items-center justify-center gap-3 pb-5">
                <button
                    type="button"
                    onClick={anterior}
                    aria-label="Imagen anterior"
                    className="rounded-full bg-white/10 p-1.5 transition-colors hover:bg-white/20"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="flex gap-2">
                    {FOTOS.map((src, i) => (
                        <button
                            key={src}
                            type="button"
                            onClick={() => setIndice(i)}
                            aria-label={`Ir a la foto ${i + 1}`}
                            className={`h-2 w-2 rounded-full transition-colors ${i === indice ? 'bg-primary' : 'bg-white/30'}`}
                        />
                    ))}
                </div>
                <button
                    type="button"
                    onClick={siguiente}
                    aria-label="Imagen siguiente"
                    className="rounded-full bg-white/10 p-1.5 transition-colors hover:bg-white/20"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>}
        </section>
    );
}
