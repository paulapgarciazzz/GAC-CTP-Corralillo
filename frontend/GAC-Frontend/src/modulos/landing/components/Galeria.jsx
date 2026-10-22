import { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { usePersonalizacion } from '../../Personalizacion/publico/usePersonalizacion';
import { useCerrarConEscape } from '../../../hooks/useCerrarConEscape';

/**
 * Galería opcional de la landing (Personalización › Apariencia y galería).
 * No se muestra si está desactivada o no tiene fotos activas.
 */
export default function Galeria() {
    const { apariencia, galeria } = usePersonalizacion();
    const [abierta, setAbierta] = useState(null);
    useCerrarConEscape(abierta !== null, () => setAbierta(null));

    if (galeria.length === 0) return null;

    const mover = (paso) => setAbierta((indice) => (indice + paso + galeria.length) % galeria.length);
    const foto = abierta !== null ? galeria[abierta] : null;

    return (
        <section id="galeria" className="scroll-mt-24 bg-background py-20">
            <div className="container mx-auto px-4">
                <div className="mx-auto mb-10 max-w-2xl text-center">
                    <h2 className="text-3xl font-bold text-foreground sm:text-4xl">{apariencia.galeria_titulo}</h2>
                    {apariencia.galeria_descripcion && (
                        <p className="mt-3 text-foreground-soft">{apariencia.galeria_descripcion}</p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {galeria.map((item, indice) => (
                        <button
                            key={item.id_foto}
                            type="button"
                            onClick={() => setAbierta(indice)}
                            className="group relative aspect-4/3 overflow-hidden rounded-xl border border-border bg-surface cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            aria-label={item.titulo ? `Ver foto: ${item.titulo}` : `Ver foto ${indice + 1}`}
                        >
                            <img src={item.url} alt={item.titulo ?? ''} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                            {item.titulo && (
                                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-2 pt-6 text-left text-xs font-medium text-white sm:text-sm">
                                    {item.titulo}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {foto && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4" onClick={() => setAbierta(null)} role="dialog" aria-modal="true" aria-label={foto.titulo ?? 'Foto de la galería'}>
                    <button type="button" onClick={() => setAbierta(null)} aria-label="Cerrar" className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 cursor-pointer">
                        <X size={22} />
                    </button>
                    {galeria.length > 1 && (
                        <>
                            <button type="button" onClick={(e) => { e.stopPropagation(); mover(-1); }} aria-label="Foto anterior" className="absolute left-2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 cursor-pointer sm:left-6">
                                <ChevronLeft size={24} />
                            </button>
                            <button type="button" onClick={(e) => { e.stopPropagation(); mover(1); }} aria-label="Foto siguiente" className="absolute right-2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 cursor-pointer sm:right-6">
                                <ChevronRight size={24} />
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
