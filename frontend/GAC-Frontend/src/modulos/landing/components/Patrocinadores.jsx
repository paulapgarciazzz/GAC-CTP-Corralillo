import { usePatrocinadoresPublicos } from '../hooks/usePatrocinadoresPublicos';

export default function Patrocinadores() {
    const { patrocinadores, titulo, descripcion, cargando } = usePatrocinadoresPublicos();

    // Sección completamente oculta mientras carga o si no hay patrocinadores
    // activos — el Footer siempre queda como último elemento de la página.
    if (cargando || patrocinadores.length === 0) return null;

    return (
        <section id="patrocinadores" className="scroll-mt-24 bg-background py-16">
            <div className="container mx-auto px-4">
                <div className="mx-auto mb-10 max-w-2xl text-center">
                    <h2 className="text-3xl font-bold text-foreground sm:text-4xl">{titulo}</h2>
                    {descripcion && (
                        <p className="mt-3 text-foreground-soft">{descripcion}</p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {patrocinadores.map((patrocinador) => {
                        const tarjeta = (
                            <div className="flex h-28 items-center justify-center rounded-xl border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md">
                                <img
                                    src={patrocinador.logotipo_url}
                                    alt={patrocinador.nombre}
                                    className="h-full w-full object-contain"
                                />
                            </div>
                        );

                        return patrocinador.enlace ? (
                            <a
                                key={patrocinador.id_patrocinador}
                                href={patrocinador.enlace}
                                target="_blank"
                                rel="noreferrer"
                                aria-label={patrocinador.nombre}
                            >
                                {tarjeta}
                            </a>
                        ) : (
                            <div key={patrocinador.id_patrocinador} aria-label={patrocinador.nombre}>
                                {tarjeta}
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
