import { Search, X } from 'lucide-react';

export default function BarraBusqueda({ valor, onChange, onLimpiar, placeholder = 'Buscar por nombre o correo' }) {
    return (
        <div className="relative w-full sm:max-w-sm">
            <Search size={18} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-foreground-faint" />
            <input
                type="search"
                value={valor}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                aria-label={placeholder}
                className="w-full h-11 pl-10 pr-10 border border-border rounded-lg bg-surface text-foreground placeholder:text-foreground-faint focus:outline-none focus:ring-2 focus:ring-primary [&::-webkit-search-cancel-button]:hidden"
            />
            {valor && (
                <button
                    type="button"
                    onClick={onLimpiar}
                    aria-label="Limpiar búsqueda"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 inline-flex items-center justify-center rounded-md text-foreground-faint hover:text-foreground hover:bg-background transition-colors cursor-pointer"
                >
                    <X size={16} />
                </button>
            )}
        </div>
    );
}
