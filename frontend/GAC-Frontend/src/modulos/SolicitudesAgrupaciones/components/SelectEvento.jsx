import { useMemo } from 'react';
import { useEventos, filtrarEventosProximos } from '../hooks/useEventos';

export const MENSAJE_EVENTO_REQUERIDO = 'Debe seleccionar el evento en el que desea participar.';

export default function SelectEvento({ value, onChange, idIncluido = null, error = '' }) {
    const { eventos, cargando } = useEventos();
    const opciones = useMemo(() => filtrarEventosProximos(eventos, idIncluido), [eventos, idIncluido]);
    const sinEventos = !cargando && opciones.length === 0;

    return (
        <div className="space-y-1 sm:col-span-2">
            <label htmlFor="id_evento" className="text-xs font-medium text-foreground-soft uppercase tracking-wider block">Evento a participar</label>
            <select id="id_evento" name="id_evento" value={value} onChange={onChange} disabled={cargando} required aria-invalid={Boolean(error)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="" disabled>{cargando ? 'Cargando eventos...' : 'Selecciona un evento'}</option>
                {opciones.map((evento) => (
                    <option key={evento.id} value={evento.id}>{evento.title} ({evento.fechaInicio.split('-').reverse().join('/')})</option>
                ))}
            </select>
            {sinEventos && <p className="text-xs text-foreground-faint">No hay eventos próximos disponibles en este momento.</p>}
            {error && <p className="text-xs text-danger">{error}</p>}
        </div>
    );
}
