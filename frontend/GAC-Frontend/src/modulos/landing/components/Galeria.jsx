import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { usePersonalizacion } from '../../Personalizacion/publico/usePersonalizacion';
import { useCerrarConEscape } from '../../../hooks/useCerrarConEscape';
import { useAtraparFoco } from '../../../hooks/useAtraparFoco';
import EncabezadoSeccion from './EncabezadoSeccion';

const BOTON_VISOR = 'absolute inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 cursor-pointer';

/**
 * Galería opcional de la landing (Personalización › Apariencia y galería).
 * No se muestra si está desactivada o no tiene fotos activas.
 */
export default function Galeria() {
    const { apariencia, galeria } = usePersonalizacion();
    const [abierta, setAbierta] = useState(null);
    const visorRef = useRef(null);
    useCerrarConEscape(abierta !== null, () => setAbierta(null));
    useAtraparFoco(abierta !== null, visorRef);

    if (galeria.length === 0) return null;

    const mover = (paso) => setAbierta((indice) => (indice + paso + galeria.length) % galeria.length);
    const foto = abierta !== null ? galeria[abierta] : null;

    return (
        <section id="galeria" aria-labelledby="titulo-galeria" className="scroll-mt-24 bg-background py-16 sm:py-20">
            <div className="container mx-auto px-4">
                <EncabezadoSeccion
                    id="titulo-galeria"
                    titulo={apariencia.galeria_titulo}
                    descripcion={apariencia.galeria_descripcion}
                    className="mb-10"
                />

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {galeria.map((item, indice) => (
                        <button
                            key={item.id_foto}
                            type="button"
                            onClick={() => setAbierta(indice)}
                            className="group relative aspect-4/3 overflow-hidden rounded-xl border border-border bg-surface cursor-pointer"
                            aria-label={item.titulo ? `Ver foto: ${item.titulo}` : `Ver foto ${indice + 1}`}
                        >
                            <img src={item.url} alt={item.titulo ?? ''} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-300 motion-safe:group-hover:scale-105" />
                            {item.titulo && (
                                <span className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/75 to-transparent px-3 pb-2 pt-6 text-left text-xs font-medium text-white sm:text-sm">
                                    {item.titulo}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {foto && (
                <div ref={visorRef} tabIndex={-1} className="fixed inset-0 z-50 flex animate-aparecer items-center justify-center bg-black/90 p-4 focus:outline-none" onClick={() => setAbierta(null)} role="dialog" aria-modal="true" aria-label={foto.titulo ?? 'Foto de la galería'}>
                    <button type="button" onClick={() => setAbierta(null)} aria-label="Cerrar" className={`${BOTON_VISOR} right-4 top-4`}>
                        <X size={22} aria-hidden="true" />
                    </button>
                    {galeria.length > 1 && (
                        <>
                            <button type="button" onClick={(e) => { e.stopPropagation(); mover(-1); }} aria-label="Foto anterior" className={`${BOTON_VISOR} left-2 sm:left-6`}>
                                <ChevronLeft size={24} aria-hidden="true" />
                            </button>
                            <button type="button" onClick={(e) => { e.stopPropagation(); mover(1); }} aria-label="Foto siguiente" className={`${BOTON_VISOR} right-2 sm:right-6`}>
                                <ChevronRight size={24} aria-hidden="true" />
                            </button>
                        </>
                    )}
                    <figure className="max-h-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
                        <img src={foto.url} alt={foto.titulo ?? ''} className="max-h-[80vh] w-auto rounded-lg object-contain" />
                        {foto.titulo && <figcaption className="mt-3 text-center text-sm text-white/90">{foto.titulo}</figcaption>}
                    </figure>
                </div>
            )}
        </section>
    );
}
