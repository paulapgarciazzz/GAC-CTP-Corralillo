import { Search, X } from 'lucide-react';

const TAMANOS = {
    // Barra principal de una página.
    md: { input: 'h-11 pl-10 pr-10 bg-surface', icono: 18, boton: 'h-9 w-9' },
    // Alineada con selects/inputs de filtros (py-2 text-sm).
    sm: { input: 'py-2 pl-9 pr-9 text-sm bg-background', icono: 16, boton: 'h-8 w-8' },
};

/**
 * Input de búsqueda con icono y botón para limpiar.
 * `onChange(texto)` recibe el texto; `onLimpiar` es opcional (por defecto llama `onChange('')`).
 */
export default function BarraBusqueda({
    valor,
    onChange,
    onLimpiar,
    placeholder = 'Buscar por nombre o correo',
    ariaLabel,
    tamano = 'md',
    className = 'w-full sm:max-w-sm',
}) {
    const estilo = TAMANOS[tamano] ?? TAMANOS.md;
    const limpiar = onLimpiar ?? (() => onChange(''));

    return (
        <div className={`relative ${className}`}>
            <Search size={estilo.icono} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-foreground-faint" />
            <input
                type="search"
                value={valor}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                aria-label={ariaLabel ?? placeholder}
                className={`w-full ${estilo.input} border border-border rounded-lg text-foreground placeholder:text-foreground-faint focus:outline-none focus:ring-2 focus:ring-primary [&::-webkit-search-cancel-button]:hidden`}
            />
            {valor && (
                <button
                    type="button"
                    onClick={limpiar}
                    aria-label="Limpiar búsqueda"
                    className={`absolute right-1 top-1/2 -translate-y-1/2 ${estilo.boton} inline-flex items-center justify-center rounded-md text-foreground-faint hover:text-foreground hover:bg-primary/10 transition-colors cursor-pointer`}
                >
                    <X size={16} />
                </button>
            )}
        </div>
    );
}
