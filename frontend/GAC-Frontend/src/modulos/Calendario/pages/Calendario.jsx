import { useEffect, useState } from 'react';
import CalendarToolbar from '../components/CalendarToolbar';
import MonthView from '../components/MonthView';
import WeekView from '../components/WeekView';
import DayView from '../components/DayView';
import ModalCrearEvento from '../components/ModalCrearEvento';
import TablaEventos from '../components/TablaEventos';
import ModalActividad from '../components/ModalActividad';
import ModalActividadesEvento from '../components/ModalActividadesEvento';
import ModalConfirmarEliminacion from '../components/ModalConfirmarEliminacion';
import { useActividades } from '../hooks/useActividades';
import {
    obtenerEventos,
    crearEvento,
    actualizarEvento,
    eliminarEvento,
} from '../services/eventoService';
import { obtenerActividades } from '../services/actividadService';

const MODAL_ACTIVIDAD_CERRADO = { abierto: false, evento: null, actividad: null };

export default function Calendario() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('month');
    const [events, setEvents] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [eventoEditando, setEventoEditando] = useState(null);
    const [eventoConActividades, setEventoConActividades] = useState(null);
    const [modalActividad, setModalActividad] = useState(MODAL_ACTIVIDAD_CERRADO);
    const {
        obtenerDeEvento,
        establecerActividades,
        guardarActividad,
        quitarActividadesDeEvento,
        eliminacion: eliminacionActividad,
    } = useActividades();

    useEffect(() => {
        let activo = true;

        const cargar = async () => {
            const [resultadoEventos, resultadoActividades] = await Promise.all([
                obtenerEventos(),
                obtenerActividades(),
            ]);
            if (!activo) return;
            if (resultadoEventos.success) {
                setEvents(resultadoEventos.data);
            } else {
                setError(resultadoEventos.error);
            }
            if (resultadoActividades.success) {
                establecerActividades(resultadoActividades.data);
            } else if (resultadoEventos.success) {
                setError(resultadoActividades.error);
            }
            setCargando(false);
        };

        cargar();
        return () => {
            activo = false;
        };
    }, [establecerActividades]);

    const goToday = () => setCurrentDate(new Date());

    const handleDayClick = (day) => {
        setCurrentDate(day);
        setViewMode('day');
    };

    const abrirCrear = () => {
        setEventoEditando(null);
        setIsModalOpen(true);
    };

    const abrirEditar = (evento) => {
        setEventoEditando(evento);
        setIsModalOpen(true);
    };

    const cerrarModal = () => {
        setIsModalOpen(false);
        setEventoEditando(null);
    };

    const handleCreateEvent = async (evento) => {
        const resultado = await crearEvento(evento);
        if (resultado.success) {
            setEvents((prev) => [...prev, resultado.data]);
        }
        return resultado;
    };

    const handleUpdateEvent = async (id, evento) => {
        const resultado = await actualizarEvento(id, evento);
        if (resultado.success) {
            setEvents((prev) => prev.map((item) => (item.id === id ? resultado.data : item)));
        }
        return resultado;
    };

    const handleDeleteEvent = async (id) => {
        const resultado = await eliminarEvento(id);
        if (resultado.success) {
            setEvents((prev) => prev.filter((item) => item.id !== id));
            quitarActividadesDeEvento(id);
            setError('');
        } else {
            setError(resultado.error);
        }
        return resultado;
    };

    const cerrarModalActividad = () => setModalActividad(MODAL_ACTIVIDAD_CERRADO);

    const handleGuardarActividad = async (datos) => {
        const resultado = await guardarActividad(modalActividad, datos);
        if (resultado.success) cerrarModalActividad();
        return resultado;
    };

    return (
        <div className="space-y-4">
            {error && (
                <div role="alert" className="mx-auto w-full max-w-5xl p-3 bg-danger-soft border border-danger/30 rounded-lg text-danger text-sm">
                    {error}
                </div>
            )}
            <div className="mx-auto w-full max-w-5xl">
                <CalendarToolbar
                    currentDate={currentDate}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    onToday={goToday}
                    onDateChange={setCurrentDate}
                />
            </div>
            <div className="mx-auto w-full max-w-5xl overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
                {viewMode === 'month' && (
                    <MonthView
                        currentDate={currentDate}
                        events={events}
                        onDayClick={handleDayClick}
                        onEventClick={setEventoConActividades}
                    />
                )}
                {viewMode === 'week' && (
                    <WeekView currentDate={currentDate} events={events} onEventClick={setEventoConActividades} />
                )}
                {viewMode === 'day' && (
                    <DayView currentDate={currentDate} events={events} onEventClick={setEventoConActividades} />
                )}
            </div>
            <TablaEventos
                events={events}
                cargando={cargando}
                onCreateClick={abrirCrear}
                onEdit={abrirEditar}
                onDelete={handleDeleteEvent}
                actividadesDeEvento={obtenerDeEvento}
                onAddActividad={(evento) => setModalActividad({ abierto: true, evento, actividad: null })}
                onEditActividad={(evento, actividad) => setModalActividad({ abierto: true, evento, actividad })}
                onDeleteActividad={eliminacionActividad.abrir}
            />
            <ModalCrearEvento
                open={isModalOpen}
                evento={eventoEditando}
                onClose={cerrarModal}
                onCreate={handleCreateEvent}
                onUpdate={handleUpdateEvent}
                onDelete={handleDeleteEvent}
            />
            <ModalActividadesEvento
                evento={eventoConActividades}
                actividades={eventoConActividades ? obtenerDeEvento(eventoConActividades.id) : []}
                onClose={() => setEventoConActividades(null)}
            />
            <ModalActividad
                open={modalActividad.abierto}
                evento={modalActividad.evento}
                actividad={modalActividad.actividad}
                onClose={cerrarModalActividad}
                onGuardar={handleGuardarActividad}
            />
            <ModalConfirmarEliminacion
                open={Boolean(eliminacionActividad.elemento)}
                titulo="Eliminar actividad"
                nombre={eliminacionActividad.elemento?.titulo}
                textoBoton="Eliminar actividad"
                loading={eliminacionActividad.eliminando}
                error={eliminacionActividad.error}
                onClose={eliminacionActividad.cerrar}
                onConfirm={eliminacionActividad.confirmar}
            />
        </div>
    );
}
