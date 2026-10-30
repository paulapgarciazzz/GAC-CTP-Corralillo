import { usePatrocinadoresPublicos } from '../hooks/usePatrocinadoresPublicos';
import EncabezadoSeccion from './EncabezadoSeccion';

const TARJETA_CLASS = 'flex h-28 items-center justify-center rounded-xl border border-border bg-surface p-4 shadow-sm transition duration-200 ease-out';

export default function Patrocinadores() {
    const { patrocinadores, titulo, descripcion, cargando } = usePatrocinadoresPublicos();

    // Sección completamente oculta mientras carga o si no hay patrocinadores
    // activos — el Footer siempre queda como último elemento de la página.
    if (cargando || patrocinadores.length === 0) return null;

    return (
        <section id="patrocinadores" aria-labelledby="titulo-patrocinadores" className="scroll-mt-24 bg-background py-16 sm:py-20">
            <div className="container mx-auto px-4">
                <EncabezadoSeccion id="titulo-patrocinadores" titulo={titulo} descripcion={descripcion} className="mb-10" />

                <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {patrocinadores.map((patrocinador) => {
                        const logo = (
                            <img
                                src={patrocinador.logotipo_url}
                                alt={patrocinador.nombre}
                                loading="lazy"
                                decoding="async"
                                className="h-full w-full object-contain"
                            />
                        );

                        return (
                            <li key={patrocinador.id_patrocinador}>
                                {patrocinador.enlace ? (
                                    <a
                                        href={patrocinador.enlace}
                                        target="_blank"
                                        rel="noreferrer"
                                        className={`${TARJETA_CLASS} hover:shadow-md motion-safe:hover:-translate-y-0.5`}
                                    >
                                        {logo}
                                    </a>
                                ) : (
                                    <div className={TARJETA_CLASS}>{logo}</div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </div>
        </section>
    );
}
