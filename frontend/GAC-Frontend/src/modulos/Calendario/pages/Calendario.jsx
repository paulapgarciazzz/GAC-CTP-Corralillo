import { useState } from 'react';
import { addMonths, addWeeks, addDays } from 'date-fns';
import CalendarToolbar from '../components/CalendarToolbar';
import MonthView from '../components/MonthView';
import WeekView from '../components/WeekView';
import DayView from '../components/DayView';
import ModalCrearEvento from '../components/ModalCrearEvento';
import TablaEventos from '../components/TablaEventos';
import { sampleEvents } from '../data/sampleEvents';

const STEP_FN = {
    month: addMonths,
    week: addWeeks,
    day: addDays,
};

export default function Calendario() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('month');
    const [events, setEvents] = useState(sampleEvents);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const goToday = () => setCurrentDate(new Date());
    const goPrev = () => setCurrentDate((prev) => STEP_FN[viewMode](prev, -1));
    const goNext = () => setCurrentDate((prev) => STEP_FN[viewMode](prev, 1));

    const handleDayClick = (day) => {
        setCurrentDate(day);
        setViewMode('day');
    };

    const handleCreateEvent = (evento) => {
        setEvents((prev) => [...prev, evento]);
    };

    return (
        <div className="space-y-4">
            <CalendarToolbar
                currentDate={currentDate}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                onToday={goToday}
                onPrev={goPrev}
                onNext={goNext}
                onDateChange={setCurrentDate}
            />
            <div className="w-full max-w-5xl overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
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
