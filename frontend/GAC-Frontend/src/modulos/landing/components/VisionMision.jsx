import { Eye, Target } from 'lucide-react';

const VisionMision = () => {
    return (
        <section id="conocenos" className="scroll-mt-24 bg-background py-20">
            <div className="container mx-auto px-4">
                <div className="mx-auto mb-14 max-w-2xl text-center">
                    <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Conócenos</h2>
                    <p className="mt-2 text-sm font-semibold uppercase tracking-widest text-accent">
                        Educación · Progreso · Libertad
                    </p>
                    <p className="mt-3 text-foreground-soft">
                        Desde 1977 formando estudiantes técnicos comprometidos con Corralillo, Nicoya y Guanacaste.
                    </p>
                </div>

                <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
                    <div className="group rounded-2xl border border-border bg-surface p-8 shadow-sm transition-all hover:border-primary/40 hover:shadow-lg">
                        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                            <Eye className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="mb-3 text-xl font-bold text-foreground">Visión</h3>
                        <p className="leading-relaxed text-foreground-soft">
                            Ser una institución educativa líder en la región, reconocida por su
                            excelencia académica, formación integral y compromiso con el
                            desarrollo sostenible, formando ciudadanos críticos, creativos y
                            solidarios.
                        </p>
                    </div>
                    <div className="group rounded-2xl border border-border bg-surface p-8 shadow-sm transition-all hover:border-accent/40 hover:shadow-lg">
                        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                            <Target className="h-6 w-6 text-accent" />
                        </div>
                        <h3 className="mb-3 text-xl font-bold text-foreground">Misión</h3>
                        <p className="leading-relaxed text-foreground-soft">
                            Ofrecer una educación de calidad basada en valores, innovación
                            pedagógica y tecnología, que potencie las habilidades de nuestros
                            estudiantes y los prepare para enfrentar los desafíos del mundo
                            actual, con responsabilidad social y respeto por la diversidad.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default VisionMision;
