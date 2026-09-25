import { useState } from 'react';
import CalendarToolbar from '../components/CalendarToolbar';
import MonthView from '../components/MonthView';
import WeekView from '../components/WeekView';
import DayView from '../components/DayView';
import ModalCrearEvento from '../components/ModalCrearEvento';
import TablaEventos from '../components/TablaEventos';
import { sampleEvents } from '../data/sampleEvents';

export default function Calendario() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('month');
    const [events, setEvents] = useState(sampleEvents);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const goToday = () => setCurrentDate(new Date());

    const handleDayClick = (day) => {
        setCurrentDate(day);
        setViewMode('day');
    };

    const handleCreateEvent = (evento) => {
        setEvents((prev) => [...prev, evento]);
    };

    return (
        <div className="space-y-4">
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
                    <MonthView currentDate={currentDate} events={events} onDayClick={handleDayClick} />
                )}
                {viewMode === 'week' && <WeekView currentDate={currentDate} events={events} />}
                {viewMode === 'day' && <DayView currentDate={currentDate} events={events} />}
            </div>
            <TablaEventos events={events} onCreateClick={() => setIsModalOpen(true)} />
            <ModalCrearEvento
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreate={handleCreateEvent}
            />
        </div>
    );
}
