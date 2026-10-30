/**
 * Título común de las secciones de la landing: rótulo opcional, título y descripción.
 * `id` permite enlazar la sección con aria-labelledby.
 */
export default function EncabezadoSeccion({ id, etiqueta, titulo, descripcion, className = 'mb-12' }) {
    return (
        <div className={`mx-auto max-w-2xl text-center ${className}`}>
            {etiqueta && (
                <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent">{etiqueta}</p>
            )}
            <h2 id={id} className="text-3xl font-semibold text-foreground sm:text-4xl">{titulo}</h2>
            <span aria-hidden="true" className="mx-auto mt-4 block h-1 w-12 rounded-full bg-primary" />
            {descripcion && (
                <p className="mt-4 text-base text-foreground-soft sm:text-lg">{descripcion}</p>
            )}
        </div>
    );
}
