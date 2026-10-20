import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pencil, Trash2 } from 'lucide-react';
import { etiquetaCategoria } from '../lib/categorias';

/**
 * Cada acción (y la manija de arrastre con `arrastrable`) solo se muestra si la página
 * la habilita según los permisos del usuario.
 */
export default function TarjetaPatrocinador({ patrocinador, arrastrable = false, onEditar, onEliminar, onToggleActivo }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: patrocinador.id_patrocinador,
        disabled: !arrastrable,
    });

    const estilo = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={estilo}
            className="bg-surface border border-border rounded-lg shadow-sm overflow-hidden flex items-center gap-3 p-3"
        >
            {arrastrable && (
                <button
                    type="button"
                    {...attributes}
                    {...listeners}
                    aria-label={`Arrastrar para reordenar ${patrocinador.nombre}`}
                    className="p-1.5 text-foreground-faint hover:text-foreground-soft cursor-grab active:cursor-grabbing shrink-0 touch-none"
                >
                    <GripVertical size={18} />
                </button>
            )}

            <div className="h-14 w-14 shrink-0 rounded-lg border border-border bg-background flex items-center justify-center overflow-hidden">
                <img src={patrocinador.logotipo_url} alt={patrocinador.nombre} className="h-full w-full object-contain p-1" />
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{patrocinador.nombre}</p>
                <div className="flex flex-wrap items-center gap-2 mt-0.5">
                    {patrocinador.categoria && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                            {etiquetaCategoria(patrocinador.categoria)}
                        </span>
                    )}
                    <span className={`text-xs px-1.5 py-0.5 rounded ${patrocinador.activo ? 'bg-success-soft text-success' : 'bg-background text-foreground-faint border border-border'}`}>
                        {patrocinador.activo ? 'Visible' : 'Oculto'}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
                {onToggleActivo && (
                    <button
                        type="button"
                        onClick={() => onToggleActivo(patrocinador)}
                        className="px-2 py-1.5 text-xs rounded-md border border-border text-foreground-soft hover:bg-background transition-colors cursor-pointer"
                    >
                        {patrocinador.activo ? 'Ocultar' : 'Mostrar'}
                    </button>
                )}
                {onEditar && (
                    <button
                        type="button"
                        onClick={() => onEditar(patrocinador)}
                        aria-label={`Editar ${patrocinador.nombre}`}
                        title="Editar"
                        className="p-1.5 rounded-md border border-primary text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                    >
                        <Pencil size={13} />
                    </button>
                )}
                {onEliminar && (
                    <button
                        type="button"
                        onClick={() => onEliminar(patrocinador)}
                        aria-label={`Eliminar ${patrocinador.nombre}`}
                        title="Eliminar"
                        className="p-1.5 rounded-md border border-danger text-danger hover:bg-danger-soft transition-colors cursor-pointer"
                    >
                        <Trash2 size={13} />
                    </button>
                )}
            </div>
        </div>
    );
}
