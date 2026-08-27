import { Pencil, Trash2, Users } from 'lucide-react';

export default function TarjetaAgrupacion({ agrupacion, onEditar, onEliminar }) {
    return (
        <div className="bg-surface border border-border rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="aspect-square bg-primary/10 flex items-center justify-center overflow-hidden">
                {agrupacion.foto_url ? (
                    <img src={agrupacion.foto_url} alt={agrupacion.nombre} className="w-full h-full object-cover" />
                ) : (
                    <Users size={28} className="text-primary/40" />
                )}
            </div>

            <div className="p-2.5 space-y-1.5">
                <h3 className="h-8 flex items-center justify-center text-xs font-semibold text-foreground text-center wrap-break-word line-clamp-2">
                    {agrupacion.nombre}
                </h3>

                <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] text-foreground-faint shrink-0">
                        Miembros: {agrupacion.cantidad_integrantes}
                    </span>

                    <div className="flex items-center gap-1 shrink-0">
                        <button
                            type="button"
                            onClick={() => onEditar(agrupacion)}
                            aria-label={`Editar ${agrupacion.nombre}`}
                            className="p-1 rounded-md border border-primary text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                        >
                            <Pencil size={12} />
                        </button>
                        <button
                            type="button"
                            onClick={() => onEliminar(agrupacion)}
                            aria-label={`Eliminar ${agrupacion.nombre}`}
                            className="p-1 rounded-md border border-danger text-danger hover:bg-danger-soft transition-colors cursor-pointer"
                        >
                            <Trash2 size={12} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
