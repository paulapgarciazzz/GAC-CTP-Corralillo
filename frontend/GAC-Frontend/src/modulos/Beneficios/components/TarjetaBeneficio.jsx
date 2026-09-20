import { Pencil, Trash2 } from 'lucide-react';
import { BENEFICIO_CONFIG } from '../services/beneficioService';

function Dato({ label, value }) {
    return (
        <div>
            <p className="text-[11px] uppercase tracking-wider text-foreground-faint">{label}</p>
            <p className="text-sm text-foreground-soft truncate">{value || '—'}</p>
        </div>
    );
}

export default function TarjetaBeneficio({ categoria, beneficio, onEditar, onEliminar }) {
    const config = BENEFICIO_CONFIG[categoria];
    const identificador = beneficio[config.idField];

    return (
        <article className="bg-surface border border-border rounded-xl shadow-sm p-4 flex flex-col gap-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs font-medium text-primary uppercase tracking-wider">{config.label}</p>
                    <h3 className="mt-1 text-base font-semibold text-foreground truncate">{categoria === 'transporte' ? beneficio.matricula : beneficio.nombre ?? beneficio.nombre_ruta ?? beneficio.tiempo_comida}</h3>
                </div>
                <span className="shrink-0 text-xs text-foreground-faint">#{identificador}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {categoria === 'alimentacion' && <Dato label="Tiempo de comida" value={beneficio.tiempo_comida} />}
                {categoria === 'aula' && <><Dato label="Nombre" value={beneficio.nombre} /><Dato label="Capacidad" value={beneficio.capacidad} /><Dato label="Encargado" value={beneficio.encargado} /></>}
                {categoria === 'mobiliario' && <><Dato label="Nombre" value={beneficio.nombre} /><Dato label="Cantidad disponible" value={beneficio.cantidad_disponible} /><Dato label="Encargado" value={beneficio.encargado} /></>}
                {categoria === 'ruta' && <Dato label="Ruta" value={beneficio.nombre_ruta} />}
                {categoria === 'transporte' && <><Dato label="Tipo" value={beneficio.tipo} /><Dato label="Capacidad" value={beneficio.capacidad} /><Dato label="Conductor" value={`${beneficio.nombre_conductor ?? ''} ${beneficio.apellido_conductor ?? ''}`.trim()} /><Dato label="Cédula" value={beneficio.cedula_conductor} /></>}
            </div>

            <div className="flex justify-end gap-2 border-t border-border pt-3">
                <button type="button" onClick={() => onEditar(beneficio)} aria-label={`Editar ${config.label.toLowerCase()} ${identificador}`} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-primary text-primary hover:bg-primary/10 text-sm font-medium transition-colors cursor-pointer">
                    <Pencil size={14} />Editar
                </button>
                <button type="button" onClick={() => onEliminar(beneficio)} aria-label={`Eliminar ${config.label.toLowerCase()} ${identificador}`} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-danger text-danger hover:bg-danger-soft text-sm font-medium transition-colors cursor-pointer">
                    <Trash2 size={14} />Eliminar
                </button>
            </div>
        </article>
    );
}
