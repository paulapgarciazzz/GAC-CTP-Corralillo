export default function ResumenAsignacion({ solicitud, observaciones, secciones }) {
    return (
        <div className="space-y-5">
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                <p className="text-xs font-medium text-foreground-faint uppercase tracking-wider">Solicitud</p>
                <p className="text-sm font-semibold text-foreground">{solicitud?.agrupacion?.nombre}</p>
            </div>

            {secciones.map((seccion) => (
                <div key={seccion.titulo} className="space-y-2">
                    <h4 className="text-sm font-semibold text-primary uppercase tracking-wider">{seccion.titulo}</h4>
                    {seccion.items.length === 0 ? (
                        <p className="text-xs text-foreground-faint">Sin elementos.</p>
                    ) : (
                        <ul className="space-y-1">
                            {seccion.items.map((item, indice) => (
                                <li key={indice} className="text-sm text-foreground-soft">
                                    {item}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            ))}

            {observaciones && (
                <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-primary uppercase tracking-wider">Observaciones</h4>
                    <p className="text-sm text-foreground-soft whitespace-pre-wrap">{observaciones}</p>
                </div>
            )}
        </div>
    );
}
