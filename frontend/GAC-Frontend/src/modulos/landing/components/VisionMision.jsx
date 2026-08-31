const VisionMision = () => {
  return (
    <section id="conocenos" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-[#1f4d3a] dark:text-white">Visión y Misión</h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-surface p-8 rounded-xl shadow-md hover:shadow-lg transition border border-border">
            <h3 className="text-2xl font-semibold text-primary mb-4 dark:text-white">Visión</h3>
            <p className="text-foreground-soft leading-relaxed">
              Ser una institución educativa líder en la región, reconocida por su
              excelencia académica, formación integral y compromiso con el
              desarrollo sostenible, formando ciudadanos críticos, creativos y
              solidarios.
            </p>
          </div>
          <div className="bg-surface p-8 rounded-xl shadow-md hover:shadow-lg transition border border-border">
            <h3 className="text-2xl font-semibold text-primary mb-4 dark:text-white">Misión</h3>
            <p className="text-foreground-soft leading-relaxed">
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