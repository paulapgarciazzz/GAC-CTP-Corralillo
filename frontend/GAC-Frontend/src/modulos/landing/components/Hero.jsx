import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import escudoOriginal from '../../../assets/escudo.webp';
import { usePersonalizacion } from '../../Personalizacion/publico/usePersonalizacion';
import { FOTOS_HERO_PREDETERMINADAS } from '../../Personalizacion/publico/predeterminados';
import { useCarruselFotos } from '../hooks/useCarruselFotos';

const BOTON_CONTROL = 'inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 transition-colors hover:bg-white/20 cursor-pointer';

// Tiempo máximo que el Hero espera la personalización antes de entrar con los valores originales.
const ESPERA_MAXIMA_MS = 2500;
const SIN_FOTOS = [];

// Fotos del carrusel: las subidas en Personalización › Landing o, si no hay
// ninguna activa, las fotos originales. Cuando exista un video institucional,
// basta con reemplazar este bloque de fondo por un <video> — el resto del
// layout (texto, escudo, overlay) no depende de que el fondo sea una imagen.
export default function Hero() {
    const { landing, apariencia, fotos_hero, cargando } = usePersonalizacion();
    const [esperaAgotada, setEsperaAgotada] = useState(false);

    useEffect(() => {
        if (!cargando) return undefined;
        const temporizador = setTimeout(() => setEsperaAgotada(true), ESPERA_MAXIMA_MS);
        return () => clearTimeout(temporizador);
    }, [cargando]);

    // Hasta tener los datos no se piden fotos y el contenido queda invisible, con su
    // altura reservada: así la entrada en cascada arranca con los textos reales.
    const listo = !cargando || esperaAgotada;
    const entrada = listo ? 'animate-subir' : 'invisible';
    let fotosHero = SIN_FOTOS;
    if (listo) fotosHero = fotos_hero.length > 0 ? fotos_hero.map((foto) => foto.url) : FOTOS_HERO_PREDETERMINADAS;

    const {
        fotos: FOTOS,
        indice,
        pausado,
        estaCargada,
        marcarCargada,
        marcarFallida,
        irA,
        anterior,
        siguiente,
        alternarPausa,
    } = useCarruselFotos(fotosHero);

    return (
        <section id="inicio" aria-labelledby="titulo-hero" className="relative overflow-hidden bg-rail text-white">
            <div className="absolute inset-0">
                {FOTOS.map((src, i) => (
                    <img
                        key={src}
                        src={src}
                        alt=""
                        aria-hidden="true"
                        loading={i === 0 ? 'eager' : 'lazy'}
                        fetchPriority={i === 0 ? 'high' : 'auto'}
                        decoding="async"
                        onLoad={() => marcarCargada(src)}
                        onError={() => marcarFallida(src)}
                        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${i === indice && estaCargada(src) ? 'opacity-100' : 'opacity-0'}`}
                    />
                ))}
                <div className="absolute inset-0 bg-linear-to-r from-rail via-rail/90 to-rail/60" />
                {/* Puntos decorativos que se desvanecen hacia el centro. */}
                <div aria-hidden="true" className="patron-puntos absolute inset-0 mask-l-from-10% mask-l-to-70%" />
            </div>

            <div className="relative container mx-auto grid gap-8 px-4 pt-28 pb-10 sm:pt-32 sm:pb-12 lg:grid-cols-[1.4fr_1fr] lg:items-center lg:pt-36 lg:pb-16">
                <div className="space-y-5 text-center lg:text-left">
                    {landing.hero_etiqueta && (
                        <span className={`inline-block rounded-full border border-white/25 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider sm:text-sm ${entrada}`}>
                            {landing.hero_etiqueta}
                        </span>
                    )}
                    <h1 id="titulo-hero" style={{ animationDelay: '90ms' }} className={`text-3xl font-semibold leading-tight tracking-tight sm:text-4xl md:text-5xl ${entrada}`}>
                        {landing.hero_titulo}
                    </h1>
                    <span aria-hidden="true" style={{ animationDelay: '150ms' }} className={`mx-auto block h-1 w-14 rounded-full bg-rail-activo lg:mx-0 ${entrada}`} />
                    {landing.hero_descripcion && (
                        <p style={{ animationDelay: '200ms' }} className={`mx-auto max-w-xl text-base text-white/85 sm:text-lg lg:mx-0 ${entrada}`}>
                            {landing.hero_descripcion}
                        </p>
                    )}
                </div>

                <div style={{ animationDelay: '280ms' }} className={`relative flex h-44 items-center justify-center sm:h-56 lg:h-72 lg:justify-end ${entrada}`}>
                    {/* Anillos sobrios detrás del escudo (sin desenfoques: no cuestan render). El exterior gira muy lento
                        y llega justo al borde del contenedor: en anchos de exactamente un breakpoint no se recorta. */}
                    <div aria-hidden="true" className="absolute h-40 w-40 rounded-full border border-white/15 bg-white/5 sm:h-52 sm:w-52 lg:right-2 lg:h-64 lg:w-64" />
                    <div aria-hidden="true" className="absolute h-52 w-52 animate-girar-lento rounded-full border-2 border-dashed border-white/15 sm:h-64 sm:w-64 lg:-right-4 lg:h-76 lg:w-76" />
                    <img
                        src={apariencia.escudo_url || escudoOriginal}
                        alt="Escudo oficial del CTP de Corralillo"
                        width="160"
                        height="160"
                        className="relative z-10 h-28 w-28 object-contain drop-shadow-xl sm:h-36 sm:w-36 lg:mr-14 lg:h-40 lg:w-40"
                    />
                </div>
            </div>

            {(!listo || FOTOS.length > 1) && <div className={`relative flex items-center justify-center gap-3 pb-6 ${listo ? '' : 'invisible'}`}>
                <button
                    type="button"
                    onClick={anterior}
                    aria-label="Imagen anterior"
                    className={BOTON_CONTROL}
                >
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                <div className="flex items-center">
                    {FOTOS.map((src, i) => (
                        <button
                            key={src}
                            type="button"
                            onClick={() => irA(i)}
                            aria-label={`Ir a la foto ${i + 1}`}
                            aria-current={i === indice ? 'true' : undefined}
                            className="group inline-flex h-8 w-6 items-center justify-center cursor-pointer"
                        >
                            <span className={`block h-2 rounded-full transition-all duration-200 ${i === indice ? 'w-5 bg-white' : 'w-2 bg-white/40 group-hover:bg-white/70'}`} />
                        </button>
                    ))}
                </div>
                <button
                    type="button"
                    onClick={siguiente}
                    aria-label="Imagen siguiente"
                    className={BOTON_CONTROL}
                >
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
                <button
                    type="button"
                    onClick={alternarPausa}
                    aria-label={pausado ? 'Reanudar presentación' : 'Pausar presentación'}
                    className={`${BOTON_CONTROL} ml-2`}
                >
                    {pausado ? <Play className="h-4 w-4" aria-hidden="true" /> : <Pause className="h-4 w-4" aria-hidden="true" />}
                </button>
            </div>}

            {/* Curva de transición hacia la sección siguiente (Evento destacado, bg-surface). */}
            <svg aria-hidden="true" className="relative block h-8 w-full fill-surface sm:h-12" viewBox="0 0 1440 48" preserveAspectRatio="none">
                <path d="M0 48h1440V30C1200 4 960 0 720 0S240 4 0 30Z" />
            </svg>
        </section>
    );
}
