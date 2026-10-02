import { ArrowLeft } from 'lucide-react';
import { obtenerActividadesDeEvento } from '../../../Calendario/services/actividadService';
import { formatearRangoEvento, formatearHorarioEvento } from '../../../Calendario/lib/fechas';
import TablaActividades from '../../../Calendario/components/TablaActividades';
import { AlertaError } from '../../../Calendario/components/Formulario';
import { useCargarReporte } from '../../hooks/useCargarReporte';
import BotonImprimir from '../BotonImprimir';
import IndicadorCarga from '../IndicadorCarga';

function Dato({ etiqueta, valor }) {
    return (
        <p className="text-sm text-foreground-soft">
            <span className="font-semibold text-foreground">{etiqueta}:</span> {valor}
        </p>
    );
}

export default function ReporteEvento({ evento, onVolver }) {
    const { datos: actividades, cargando, error } = useCargarReporte(obtenerActividadesDeEvento, evento.id);

    return (
        <div className="space-y-4">
            <div className="print:hidden flex items-center justify-between gap-3">
                <button
                    type="button"
                    onClick={onVolver}
                    className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground-soft transition-colors hover:bg-primary/10 hover:text-primary cursor-pointer"
                >
                    <ArrowLeft size={16} />
                    Volver a eventos
                </button>
                {!cargando && !error && <BotonImprimir texto="Imprimir reporte" />}
            </div>

            <div className="hidden print:block text-center">
                <h2 className="text-xl font-bold">CTP de Corralillo</h2>
            </div>

            <div className="bg-surface border border-border rounded-xl p-4 sm:p-6 space-y-1 print:border-0 print:p-0 print:bg-transparent">
                <p className="text-xs uppercase tracking-wider text-foreground-faint">Reporte de actividades</p>
                <h3 className="text-xl font-bold text-foreground">{evento.title}</h3>
                <Dato etiqueta="Fechas" valor={formatearRangoEvento(evento)} />
                <Dato etiqueta="Horario" valor={formatearHorarioEvento(evento)} />
                {actividades && <Dato etiqueta="Total de actividades" valor={actividades.length} />}
            </div>

            <AlertaError mensaje={error} />

            {cargando ? (
                <IndicadorCarga />
            ) : (
                actividades && (actividades.length === 0 ? (
                    <div className="flex items-center justify-center py-10 border border-border rounded-xl bg-surface">
                        <p className="text-sm text-foreground-faint text-center">Este evento no tiene actividades.</p>
                    </div>
                ) : (
                    <TablaActividades actividades={actividades} soloLectura />
                ))
            )}
        </div>
    );
}
