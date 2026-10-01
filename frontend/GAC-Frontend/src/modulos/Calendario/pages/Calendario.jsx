import { useEffect, useState } from 'react';
import CalendarToolbar from '../components/CalendarToolbar';
import MonthView from '../components/MonthView';
import WeekView from '../components/WeekView';
import DayView from '../components/DayView';
import ModalCrearEvento from '../components/ModalCrearEvento';
import TablaEventos from '../components/TablaEventos';
import {
    obtenerEventos,
    crearEvento,
    actualizarEvento,
    eliminarEvento,
} from '../services/eventoService';

export default function Calendario() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('month');
    const [events, setEvents] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [eventoEditando, setEventoEditando] = useState(null);

    useEffect(() => {
        let activo = true;

        const cargar = async () => {
            const resultado = await obtenerEventos();
            if (!activo) return;
            if (resultado.success) {
                setEvents(resultado.data);
            } else {
                setError(resultado.error);
            }
            setCargando(false);
        };

        cargar();
        return () => {
            activo = false;
        };
    }, []);

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
            setError('');
        } else {
            setError(resultado.error);
        }
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
                        onEventClick={abrirEditar}
                    />
                )}
                {viewMode === 'week' && (
                    <WeekView currentDate={currentDate} events={events} onEventClick={abrirEditar} />
                )}
                {viewMode === 'day' && (
                    <DayView currentDate={currentDate} events={events} onEventClick={abrirEditar} />
                )}
            </div>
            <TablaEventos
                events={events}
                cargando={cargando}
                onCreateClick={abrirCrear}
                onEdit={abrirEditar}
                onDelete={handleDeleteEvent}
            />
            <ModalCrearEvento
                open={isModalOpen}
                evento={eventoEditando}
                onClose={cerrarModal}
                onCreate={handleCreateEvent}
                onUpdate={handleUpdateEvent}
                onDelete={handleDeleteEvent}
            />
        </div>
    );
}
