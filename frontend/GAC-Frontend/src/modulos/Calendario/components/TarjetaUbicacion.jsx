import { MapPin, Pencil, Trash2 } from 'lucide-react';

export default function TarjetaUbicacion({ ubicacion, onEditar, onEliminar }) {
    return (
        <div className="bg-surface border border-border rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col">
            <div className="aspect-square bg-primary/10 flex items-center justify-center overflow-hidden">
                {ubicacion.imagen ? (
                    <img src={ubicacion.imagen} alt={ubicacion.nombre} className="w-full h-full object-cover" />
                ) : (
                    <MapPin size={32} className="text-primary/40" />
                )}
            </div>

            <div className="p-3 space-y-2 flex-1 flex flex-col">
                <h3 className="text-sm font-semibold text-foreground wrap-break-word line-clamp-2">
                    {ubicacion.nombre}
                </h3>
                <p className="text-xs text-foreground-faint line-clamp-2 flex-1">
                    {ubicacion.descripcion || 'Sin descripción'}
                </p>

                <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 text-xs text-foreground-soft shrink-0">
                        Capacidad: {ubicacion.capacidad}
                    </span>

                    <div className="flex items-center gap-1 shrink-0">
                        <button
                            type="button"
                            onClick={() => onEditar(ubicacion)}
                            aria-label={`Editar ${ubicacion.nombre}`}
                            title="Editar"
                            className="p-1.5 rounded-md border border-primary text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                        >
                            <Pencil size={13} />
                        </button>
                        <button
                            type="button"
                            onClick={() => onEliminar(ubicacion)}
                            aria-label={`Eliminar ${ubicacion.nombre}`}
                            title="Eliminar"
                            className="p-1.5 rounded-md border border-danger text-danger hover:bg-danger-soft transition-colors cursor-pointer"
                        >
                            <Trash2 size={13} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
