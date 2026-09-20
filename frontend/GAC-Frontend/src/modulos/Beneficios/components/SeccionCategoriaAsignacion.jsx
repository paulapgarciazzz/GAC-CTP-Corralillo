import { Plus, Trash2 } from 'lucide-react';

export default function SeccionCategoriaAsignacion({ titulo, nota, filas, campos, tieneCantidad, disabled, onAgregar, onEliminar, onCambiarFila }) {
    return (
        <div className="border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-foreground">{titulo}</h3>
                    {nota && <p className="text-xs text-foreground-faint mt-0.5">{nota}</p>}
                </div>
                <button
                    type="button"
                    onClick={onAgregar}
                    disabled={disabled}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-primary text-primary hover:bg-primary/10 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Plus size={14} />Agregar
                </button>
            </div>

            {filas.length === 0 ? (
                <p className="text-xs text-foreground-faint">Sin elementos agregados.</p>
            ) : (
                <div className="space-y-2">
                    {filas.map((fila, indice) => (
                        <div key={indice} className="flex flex-wrap items-center gap-2">
                            {campos.map((campo) => (
                                <select
                                    key={campo.nombre}
                                    value={fila[campo.nombre] ?? ''}
                                    onChange={(event) => onCambiarFila(indice, campo.nombre, event.target.value)}
                                    disabled={disabled}
                                    aria-label={campo.etiqueta}
                                    className="flex-1 min-w-[140px] px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-surface-soft disabled:cursor-not-allowed"
                                >
                                    <option value="">{campo.etiqueta}...</option>
                                    {campo.opciones.map((opcion) => (
                                        <option key={opcion.value} value={opcion.value}>{opcion.label}</option>
                                    ))}
                                </select>
                            ))}

                            {tieneCantidad && (
                                <input
                                    type="number"
                                    min="1"
                                    value={fila.cantidad ?? ''}
                                    onChange={(event) => onCambiarFila(indice, 'cantidad', event.target.value)}
                                    disabled={disabled}
                                    placeholder="Cantidad"
                                    aria-label="Cantidad"
                                    className="w-24 px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-surface-soft disabled:cursor-not-allowed"
                                />
                            )}

                            <button
                                type="button"
                                onClick={() => onEliminar(indice)}
                                disabled={disabled}
                                aria-label="Eliminar elemento"
                                className="p-2 rounded-lg text-danger hover:bg-danger-soft transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
