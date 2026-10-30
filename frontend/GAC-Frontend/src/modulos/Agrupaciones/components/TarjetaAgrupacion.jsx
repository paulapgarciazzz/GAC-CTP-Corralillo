import { MapPin, Pencil, Trash2, UserRound, Users } from 'lucide-react';

const BOTON_ACCION = 'relative z-10 inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors cursor-pointer';

// Iniciales para la tarjeta sin foto ("Grupo chiva" → "GC").
const iniciales = (nombre = '') => nombre.trim().split(/\s+/).slice(0, 2).map((palabra) => palabra[0]).join('').toUpperCase();

// `onEditar` y `onEliminar` son opcionales: sin ellos no se muestra el botón.
export default function TarjetaAgrupacion({ agrupacion, onVerDetalle, onEditar, onEliminar }) {
    const encargado = agrupacion.encargado;

    return (
        <article className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-sm transition duration-200 ease-out hover:border-primary/30 hover:shadow-lg motion-safe:hover:-translate-y-0.5">
            <div className="relative aspect-4/3 overflow-hidden bg-surface-soft">
                {agrupacion.foto_url ? (
                    <img src={agrupacion.foto_url} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-300 motion-safe:group-hover:scale-105" />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-primary/15 to-primary/5">
                        <span aria-hidden="true" className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-surface font-display text-xl font-semibold text-primary shadow-sm">
                            {iniciales(agrupacion.nombre) || <Users size={26} />}
                        </span>
                    </div>
                )}
                <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-surface/95 px-2.5 py-1 text-xs font-semibold text-foreground shadow-sm">
                    <Users size={13} className="text-primary" aria-hidden="true" />
                    {agrupacion.cantidad_integrantes} {Number(agrupacion.cantidad_integrantes) === 1 ? 'miembro' : 'miembros'}
                </span>
            </div>

            <div className="flex flex-1 flex-col gap-3 p-4">
                <div className="min-w-0 space-y-1.5">
                    <h3 className="text-base font-semibold leading-snug text-foreground wrap-break-word line-clamp-2">
                        {/* Toda la tarjeta abre el detalle: el botón se extiende sobre ella con after:absolute. */}
                        <button
                            type="button"
                            onClick={() => onVerDetalle(agrupacion)}
                            className="text-left after:absolute after:inset-0 after:content-[''] cursor-pointer focus-visible:outline-none focus-visible:after:rounded-xl focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-primary"
                        >
                            {agrupacion.nombre}
                        </button>
                    </h3>
                    {agrupacion.lugar_procedencia && (
                        <p className="flex items-center gap-1.5 text-sm text-foreground-soft">
                            <MapPin size={14} className="shrink-0 text-foreground-faint" aria-hidden="true" />
                            <span className="truncate">{agrupacion.lugar_procedencia}</span>
                        </p>
                    )}
                    {encargado && (
                        <p className="flex items-center gap-1.5 text-sm text-foreground-soft">
                            <UserRound size={14} className="shrink-0 text-foreground-faint" aria-hidden="true" />
                            <span className="truncate">{`${encargado.primer_nombre ?? ''} ${encargado.apellido ?? ''}`.trim()}</span>
                        </p>
                    )}
                </div>

                {(onEditar || onEliminar) && (
                    <div className="mt-auto flex items-center justify-end gap-2 border-t border-border pt-3">
                        <div className="flex items-center gap-1.5 shrink-0">
                            {onEditar && (
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); onEditar(agrupacion); }}
                                    aria-label={`Editar ${agrupacion.nombre}`}
                                    className={`${BOTON_ACCION} border-border-input text-primary hover:border-primary hover:bg-primary/10`}
                                >
                                    <Pencil size={15} aria-hidden="true" />
                                </button>
                            )}
                            {onEliminar && (
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); onEliminar(agrupacion); }}
                                    aria-label={`Eliminar ${agrupacion.nombre}`}
                                    className={`${BOTON_ACCION} border-border-input text-danger hover:border-danger hover:bg-danger-soft`}
                                >
                                    <Trash2 size={15} aria-hidden="true" />
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </article>
    );
}
