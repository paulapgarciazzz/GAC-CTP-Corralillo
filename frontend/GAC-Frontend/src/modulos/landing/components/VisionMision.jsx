import { Eye, Target } from 'lucide-react';
import { usePersonalizacion } from '../../Personalizacion/publico/usePersonalizacion';
import EncabezadoSeccion from './EncabezadoSeccion';

// Realce al pasar el cursor: sube 4px y gana sombra (sin desplazamiento con "reducir movimiento").
const TARJETA_CLASS = 'group relative overflow-hidden rounded-2xl border border-border bg-surface p-8 shadow-sm transition duration-200 ease-out hover:border-primary/30 hover:shadow-lg motion-safe:hover:-translate-y-1';
const ICONO_CLASS = 'mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-on-primary';

const VisionMision = () => {
    const { landing } = usePersonalizacion();

    return (
        <section id="conocenos" aria-labelledby="titulo-conocenos" className="scroll-mt-24 bg-background py-16 sm:py-20">
            <div className="container mx-auto px-4">
                <EncabezadoSeccion
                    id="titulo-conocenos"
                    etiqueta={landing.lema}
                    titulo={landing.conocenos_titulo}
                    descripcion={landing.conocenos_descripcion}
                />

                <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
                    <div className={TARJETA_CLASS}>
                        <div className={ICONO_CLASS}>
                            <Eye className="h-6 w-6" aria-hidden="true" />
                        </div>
                        <h3 className="mb-3 text-xl font-semibold text-foreground">{landing.vision_titulo}</h3>
                        <p className="whitespace-pre-line leading-relaxed text-foreground-soft">
                            {landing.vision}
                        </p>
                    </div>
                    <div className={TARJETA_CLASS}>
                        <div className={ICONO_CLASS}>
                            <Target className="h-6 w-6" aria-hidden="true" />
                        </div>
                        <h3 className="mb-3 text-xl font-semibold text-foreground">{landing.mision_titulo}</h3>
                        <p className="whitespace-pre-line leading-relaxed text-foreground-soft">
                            {landing.mision}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default VisionMision;
