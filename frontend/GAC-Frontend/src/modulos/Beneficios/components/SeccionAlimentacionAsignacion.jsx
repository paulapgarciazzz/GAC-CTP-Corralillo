export default function SeccionAlimentacionAsignacion({ opciones, seleccionadas, cantidadIntegrantes, disabled, onToggle }) {
    return (
        <div className="border border-border rounded-xl p-4 space-y-3">
            <div>
                <h3 className="text-sm font-semibold text-foreground">Alimentación</h3>
                <p className="text-xs text-foreground-faint mt-0.5">
                    Se asignará x{cantidadIntegrantes ?? '—'} automáticamente (integrantes de la agrupación).
                </p>
            </div>

            {opciones.length === 0 ? (
                <p className="text-xs text-foreground-faint">No hay tipos de alimentación disponibles.</p>
            ) : (
                <div className="space-y-2">
                    {opciones.map((opcion) => {
                        const id = String(opcion.id_alimentacion);
                        const marcado = seleccionadas.includes(id);
                        return (
                            <label
                                key={id}
                                className={`flex items-center justify-between gap-3 px-3 py-2 rounded-lg border border-border transition-colors ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:bg-primary/5'}`}
                            >
                                <span className="flex items-center gap-2 text-sm text-foreground">
                                    <input
                                        type="checkbox"
                                        checked={marcado}
                                        disabled={disabled}
                                        onChange={() => onToggle(id)}
                                        className="h-4 w-4 rounded border-border text-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed"
                                    />
                                    {opcion.tiempo_comida}
                                </span>
                                {marcado && (
                                    <span className="text-xs text-foreground-faint whitespace-nowrap">
                                        {cantidadIntegrantes ?? '—'} personas
                                    </span>
                                )}
                            </label>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
