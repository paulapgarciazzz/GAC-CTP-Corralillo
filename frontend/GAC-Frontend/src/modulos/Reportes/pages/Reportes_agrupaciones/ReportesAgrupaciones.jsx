import { useState } from 'react';
import { Inbox, CheckCircle, XCircle, Clock } from 'lucide-react';
import { obtenerReporteAgrupaciones } from '../../services/reporteService';
import { useCargarReporte } from '../../hooks/useCargarReporte';
import { useEventos } from '../../../SolicitudesAgrupaciones/hooks/useEventos';
import { AlertaError } from '../../../Calendario/components/Formulario';
import TarjetaEstadistica from '../../components/Reportes_agrupaciones/TarjetaEstadistica';
import BotonImprimir from '../../components/BotonImprimir';
import IndicadorCarga from '../../components/IndicadorCarga';
import SelectEventoReporte from '../../components/SelectEventoReporte';
import GraficoSolicitudesPorMes from '../../components/Reportes_agrupaciones/GraficoSolicitudesPorMes';
import GraficoTopMeses from '../../components/Reportes_agrupaciones/GraficoTopMeses';

export default function ReportesAgrupaciones() {
    const [idEvento, setIdEvento] = useState('');
    const { eventos, cargando: cargandoEventos } = useEventos();
    const { datos: reporte, cargando, error } = useCargarReporte(obtenerReporteAgrupaciones, idEvento);
    const eventoSeleccionado = eventos.find((evento) => String(evento.id) === idEvento);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold text-foreground">Reportes de Solicitudes</h2>
                    <p className="text-sm text-foreground-soft">
                        Evento: {eventoSeleccionado?.title ?? 'Todos los eventos'}
                    </p>
                </div>
                {reporte && <BotonImprimir />}
            </div>

            <SelectEventoReporte
                eventos={eventos}
                cargando={cargandoEventos}
                value={idEvento}
                onChange={setIdEvento}
            />

            <AlertaError mensaje={error} />

            {cargando ? (
                <IndicadorCarga />
            ) : (
                reporte && (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            <TarjetaEstadistica icon={Inbox} label="Solicitudes recibidas" value={reporte.recibidas} variant="primary" />
                            <TarjetaEstadistica icon={CheckCircle} label="Aceptadas" value={reporte.aceptadas} variant="success" />
                            <TarjetaEstadistica icon={XCircle} label="Rechazadas" value={reporte.rechazadas} variant="danger" />
                            <TarjetaEstadistica icon={Clock} label="Pendientes" value={reporte.pendientes} variant="warning" />
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <GraficoSolicitudesPorMes datos={reporte.porMes} />
                            <GraficoTopMeses datos={reporte.porMes} />
                        </div>
                    </>
                )
            )}
        </div>
    );
}
