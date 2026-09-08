export default function CampoArchivoAdjunto({ archivoAdjuntoUrl, resena }) {
    if (!archivoAdjuntoUrl && !resena) {
        return (
            <div className="space-y-1">
                <p className="text-xs font-medium text-foreground-faint uppercase tracking-wider">Reseña</p>
                <p className="text-sm text-foreground">—</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {archivoAdjuntoUrl && (
                <div className="space-y-1">
                    <p className="text-xs font-medium text-foreground-faint uppercase tracking-wider">Archivo adjunto</p>
                    <a href={archivoAdjuntoUrl} target="_blank" rel="noopener noreferrer"
                        className="text-sm text-primary underline hover:text-primary-hover">
                        Ver archivo adjunto
                    </a>
                </div>
            )}
            {resena && (
                <div className="space-y-1">
                    <p className="text-xs font-medium text-foreground-faint uppercase tracking-wider">Reseña</p>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{resena}</p>
                </div>
            )}
        </div>
    );
}
