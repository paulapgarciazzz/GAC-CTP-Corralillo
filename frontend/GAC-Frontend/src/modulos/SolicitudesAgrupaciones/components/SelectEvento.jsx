import { useMemo } from 'react';
import { useEventos, filtrarEventosProximos } from '../hooks/useEventos';

export default function SelectEvento({ value, onChange, idIncluido = null }) {
    const { eventos, cargando } = useEventos();
    const opciones = useMemo(() => filtrarEventosProximos(eventos, idIncluido), [eventos, idIncluido]);

    return (
        <div className="space-y-1 sm:col-span-2">
            <label htmlFor="id_evento" className="text-xs font-medium text-foreground-soft uppercase tracking-wider block">Evento a participar</label>
            <select id="id_evento" name="id_evento" value={value} onChange={onChange} disabled={cargando}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="">{cargando ? 'Cargando eventos...' : 'Sin evento específico'}</option>
                {opciones.map((evento) => (
                    <option key={evento.id} value={evento.id}>{evento.title} ({evento.fechaInicio.split('-').reverse().join('/')})</option>
                ))}
            </select>
        </div>
    );
}
