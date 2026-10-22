import { Eye, Target } from 'lucide-react';
import { usePersonalizacion } from '../../Personalizacion/publico/usePersonalizacion';

const VisionMision = () => {
    const { landing } = usePersonalizacion();

    return (
        <section id="conocenos" className="scroll-mt-24 bg-background py-20">
            <div className="container mx-auto px-4">
                <div className="mx-auto mb-14 max-w-2xl text-center">
                    <h2 className="text-3xl font-bold text-foreground sm:text-4xl">{landing.conocenos_titulo}</h2>
                    {landing.lema && (
                        <p className="mt-2 text-sm font-semibold uppercase tracking-widest text-accent">
                            {landing.lema}
                        </p>
                    )}
                    {landing.conocenos_descripcion && (
                        <p className="mt-3 text-foreground-soft">
                            {landing.conocenos_descripcion}
                        </p>
                    )}
                </div>

                <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
                    <div className="group rounded-2xl border border-border bg-surface p-8 shadow-sm transition-all hover:border-primary/40 hover:shadow-lg">
                        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                            <Eye className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="mb-3 text-xl font-bold text-foreground">{landing.vision_titulo}</h3>
                        <p className="whitespace-pre-line leading-relaxed text-foreground-soft">
                            {landing.vision}
                        </p>
                    </div>
                    <div className="group rounded-2xl border border-border bg-surface p-8 shadow-sm transition-all hover:border-accent/40 hover:shadow-lg">
                        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                            <Target className="h-6 w-6 text-accent" />
                        </div>
                        <h3 className="mb-3 text-xl font-bold text-foreground">{landing.mision_titulo}</h3>
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
