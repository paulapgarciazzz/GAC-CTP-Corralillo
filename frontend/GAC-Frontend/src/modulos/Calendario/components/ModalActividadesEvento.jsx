import ModalBase from './ModalBase';
import TablaActividades from './TablaActividades';
import { formatearRangoEvento } from '../lib/fechas';

export default function ModalActividadesEvento({ evento, actividades, onClose }) {
    if (!evento) return null;

    const cantidad = actividades.length === 1 ? '1 actividad' : `${actividades.length} actividades`;

    return (
        <ModalBase
            titulo={evento.title}
            subtitulo={`${formatearRangoEvento(evento)} · ${cantidad}`}
            alineacion="left"
            anchoMaximo="max-w-4xl"
            onClose={onClose}
        >
            {actividades.length === 0 ? (
                <div className="flex items-center justify-center py-10 border border-border rounded-xl bg-background">
                    <p className="text-sm text-foreground-faint text-center">Este evento no tiene actividades.</p>
                </div>
            ) : (
                <TablaActividades actividades={actividades} soloLectura />
            )}
        </ModalBase>
    );
}
