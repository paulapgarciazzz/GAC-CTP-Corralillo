// Advertencia del modal de borrado: al eliminar una agrupación se eliminan sus solicitudes.
export default function DetalleEliminacionAgrupacion({ agrupacion }) {
    const solicitudes = Number(agrupacion.solicitudes_count ?? 0);

    return (
        <div className="p-3 rounded-lg bg-background border border-border text-sm text-foreground-soft space-y-1">
            {solicitudes === 0 ? (
                <p>Esta agrupación no tiene solicitudes asociadas.</p>
            ) : (
                <>
                    <p>Esta agrupación tiene <strong className="text-foreground">{solicitudes} {solicitudes === 1 ? 'solicitud' : 'solicitudes'}</strong> asociadas.</p>
                    <p>Al eliminarla también se eliminarán las solicitudes y registros relacionados.</p>
                </>
            )}
        </div>
    );
}
