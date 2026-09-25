import { addDays, setHours, setMinutes } from 'date-fns';

export const CATEGORY_COLORS = {
    success: { bg: 'bg-success-soft', text: 'text-success' },
    warning: { bg: 'bg-warning-soft', text: 'text-warning' },
    danger: { bg: 'bg-danger-soft', text: 'text-danger' },
    info: { bg: 'bg-info-soft', text: 'text-info' },
    'chart-1': { bg: 'bg-chart-1/15', text: 'text-chart-1' },
    'chart-2': { bg: 'bg-chart-2/15', text: 'text-chart-2' },
    'chart-3': { bg: 'bg-chart-3/15', text: 'text-chart-3' },
};

function at(dayOffset, hour, minute = 0) {
    return setMinutes(setHours(addDays(new Date(), dayOffset), hour), minute);
}

function timed(id, title, dayOffset, startHour, startMinute, durationMinutes, category) {
    const start = at(dayOffset, startHour, startMinute);
    const end = new Date(start.getTime() + durationMinutes * 60000);
    return { id, title, start, end, category, allDay: false };
}

function allDay(id, title, dayOffset, category) {
    const start = at(dayOffset, 0, 0);
    const end = at(dayOffset, 23, 59);
    return { id, title, start, end, category, allDay: true };
}

export const sampleEvents = [
    // Semana pasada
    timed('evt-1', 'Reunión de coordinadores', -6, 9, 0, 60, 'info'),
    timed('evt-2', 'Entrega de inventario mensual', -5, 14, 0, 90, 'chart-2'),
    allDay('evt-3', 'Feria de agrupaciones estudiantiles', -4, 'chart-3'),
    timed('evt-4', 'Auditoría de beneficios', -3, 8, 30, 120, 'danger'),

    // Esta semana — varios días cargados para probar overflow
    timed('evt-5', 'Revisión de solicitudes pendientes', 0, 8, 0, 60, 'warning'),
    timed('evt-8', 'Capacitación docente', 0, 13, 30, 90, 'info'),
    timed('evt-9', 'Entrevista con encargado nuevo', 0, 16, 0, 30, 'chart-2'),

    timed('evt-10', 'Cierre de mes contable', 1, 9, 0, 60, 'danger'),
    timed('evt-11', 'Práctica de Danza Folclórica', 1, 15, 0, 90, 'chart-3'),

    allDay('evt-12', 'Día festivo institucional', 2, 'info'),

    timed('evt-13', 'Asignación de beneficios trimestrales', 3, 9, 30, 60, 'success'),
    timed('evt-14', 'Reunión de agrupación de Ajedrez', 3, 11, 30, 45, 'chart-1'),
    timed('evt-15', 'Auditoría de solicitudes', 3, 14, 0, 60, 'danger'),

    timed('evt-16', 'Actividad cultural — Coro estudiantil', 4, 10, 0, 60, 'chart-3'),
    timed('evt-17', 'Capacitación en manejo de inventario', 4, 13, 0, 90, 'warning'),

    // Próxima semana
    timed('evt-18', 'Reunión de encargados de agrupaciones', 7, 9, 0, 60, 'info'),
    timed('evt-19', 'Entrega de beneficios — Zona Norte', 8, 10, 0, 120, 'success'),
    allDay('evt-20', 'Semana cultural CTP Corralillo', 9, 'chart-2'),
    timed('evt-21', 'Revisión de auditoría interna', 10, 8, 0, 60, 'danger'),
    timed('evt-22', 'Taller de liderazgo estudiantil', 11, 14, 0, 90, 'chart-1'),

    // En 2-3 semanas
    timed('evt-23', 'Reunión de coordinación general', 15, 9, 0, 60, 'info'),
    timed('evt-24', 'Entrega de inventario trimestral', 17, 10, 30, 90, 'chart-2'),
    timed('evt-25', 'Actividad deportiva interagrupaciones', 19, 13, 0, 120, 'success'),
    timed('evt-26', 'Capacitación en normativa de beneficios', 22, 9, 0, 60, 'warning'),
    timed('evt-27', 'Cierre de solicitudes del período', 24, 15, 0, 60, 'danger'),
];
