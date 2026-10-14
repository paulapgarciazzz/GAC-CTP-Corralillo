import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import escudo from '../../../assets/escudo.png';

// Fotos reales de actividades del colegio. Cuando exista un video institucional,
// basta con reemplazar este arreglo/bloque de fondo por un <video> — el resto
// del layout (texto, escudo, overlay) no depende de que el fondo sea una imagen.
const FOTOS = [
    'https://nicoya.go.cr/img/news/detail/293_1_vistadelaembajadoradesuizaalctpdecorralillo.jpg',
    'https://vozdeguanacaste.com/wp-content/uploads/2018/01/dsc_0061-1024x683.jpg',
    'https://cloudfront-us-east-1.images.arcpublishing.com/gruponacion/JK64NJLWHVCZPCYVYPJVGOHQ34.jpg',
];

export default function Hero() {
    const [indice, setIndice] = useState(0);

    useEffect(() => {
        const intervalo = setInterval(() => {
            setIndice((prev) => (prev + 1) % FOTOS.length);
        }, 5000);
        return () => clearInterval(intervalo);
    }, []);

    const anterior = () => setIndice((prev) => (prev - 1 + FOTOS.length) % FOTOS.length);
    const siguiente = () => setIndice((prev) => (prev + 1) % FOTOS.length);

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
                    <span className="inline-block rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-medium uppercase tracking-wide sm:text-sm">
                        Colegio Técnico Profesional
                    </span>
                    <h1 className="text-2xl font-bold leading-tight sm:text-3xl md:text-4xl">
                        CTP de Corralillo
                    </h1>
                    <p className="mx-auto max-w-xl text-sm text-white/80 sm:text-base lg:mx-0">
                        Educación técnica de calidad, formando estudiantes íntegros y comprometidos con Corralillo, Nicoya y Guanacaste desde 1977.
                    </p>
                </div>

                <div className="relative flex h-48 items-center justify-center overflow-visible sm:h-64 lg:h-72 lg:justify-end">
                    {/* Arco/semicírculo que entra desde el borde derecho del Hero, con el
                        escudo montado encima (en vez de círculos/glows simétricos alrededor). */}
                    <div className="absolute right-[-30%] top-1/2 h-48 w-48 -translate-y-1/2 rounded-full bg-linear-to-br from-primary/50 via-primary/30 to-accent/30 sm:h-72 sm:w-72 lg:right-[-18%] lg:h-88 lg:w-88" />
                    <div className="absolute right-[-26%] top-1/2 h-40 w-40 -translate-y-1/2 rounded-full border border-white/20 sm:h-60 sm:w-60 lg:right-[-14%] lg:h-72 lg:w-72" />
                    <img
                        src={escudo}
                        alt="Escudo oficial del CTP de Corralillo"
                        className="relative z-10 h-24 w-24 object-contain drop-shadow-2xl sm:h-32 sm:w-32 lg:h-36 lg:w-36 lg:mr-8"
                    />
                </div>
            </div>

            <div className="relative flex items-center justify-center gap-3 pb-5">
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
            </div>
        </section>
    );
}
