export default function CampoArchivoAdjunto({ etiqueta = 'Reseña', archivoAdjuntoUrl, resena }) {
    return (
        <div className="space-y-1">
            <p className="text-xs font-medium text-foreground-faint uppercase tracking-wider">{etiqueta}</p>
            {archivoAdjuntoUrl ? (
                <a href={archivoAdjuntoUrl} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-primary underline hover:text-primary-hover">
                    Ver archivo adjunto
                </a>
            ) : (
                <p className="text-sm text-foreground whitespace-pre-wrap">{resena || '—'}</p>
            )}
        </div>
    );
}
