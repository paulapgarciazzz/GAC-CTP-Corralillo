import { Search } from 'lucide-react';

export default function FiltrosSolicitudesAprobadas({ filtros, onChange }) {
    const actualizar = (campo) => (event) => onChange({ ...filtros, [campo]: event.target.value });

    return (
        <div className="bg-surface border border-border rounded-xl p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-faint" />
                <input
                    type="text"
                    value={filtros.agrupacion}
                    onChange={actualizar('agrupacion')}
                    placeholder="Nombre de agrupación..."
                    className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-foreground-faint focus:outline-none focus:ring-2 focus:ring-primary"
                />
            </div>

            <input
                type="text"
                value={filtros.cedula}
                onChange={actualizar('cedula')}
                placeholder="Cédula del encargado..."
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-foreground-faint focus:outline-none focus:ring-2 focus:ring-primary"
            />

            <input
                type="date"
                value={filtros.fecha}
                onChange={actualizar('fecha')}
                aria-label="Filtrar por fecha"
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />

            <select
                value={filtros.estadoAsignacion}
                onChange={actualizar('estadoAsignacion')}
                aria-label="Filtrar por estado de asignación"
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
                <option value="todas">Todas</option>
                <option value="pendiente">Pendiente de asignar</option>
                <option value="asignada">Ya asignada</option>
            </select>
        </div>
    );
}
