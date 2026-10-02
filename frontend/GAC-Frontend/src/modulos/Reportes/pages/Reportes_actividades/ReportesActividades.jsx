import { useState } from 'react';
import { obtenerEventos } from '../../../Calendario/services/eventoService';
import { AlertaError } from '../../../Calendario/components/Formulario';
import { useFiltroEventos } from '../../../Calendario/hooks/useFiltroEventos';
import { useCargarReporte } from '../../hooks/useCargarReporte';
import IndicadorCarga from '../../components/IndicadorCarga';
import ListaEventosReporte from '../../components/Reportes_actividades/ListaEventosReporte';
import ReporteEvento from '../../components/Reportes_actividades/ReporteEvento';

const SIN_EVENTOS = [];

export default function ReportesActividades() {
    const { datos: eventos, cargando, error } = useCargarReporte(obtenerEventos);
    const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
    // El filtro vive aquí para conservarse al volver desde el reporte de un evento.
    const filtro = useFiltroEventos(eventos ?? SIN_EVENTOS);

    if (eventoSeleccionado) {
        return (
            <ReporteEvento
                key={eventoSeleccionado.id}
                evento={eventoSeleccionado}
                onVolver={() => setEventoSeleccionado(null)}
            />
        );
    }

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-lg font-semibold text-foreground">Reportes de Actividades</h2>
                <p className="mt-1 text-sm text-foreground-soft">
                    Selecciona un evento para ver e imprimir sus actividades ordenadas por fecha y hora.
                </p>
            </div>

            <AlertaError mensaje={error} />

            {cargando ? (
                <IndicadorCarga />
            ) : (
                eventos && <ListaEventosReporte filtro={filtro} onVer={setEventoSeleccionado} />
            )}
        </div>
    );
}
