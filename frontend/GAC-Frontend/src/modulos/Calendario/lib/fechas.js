import { format, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Fecha 'yyyy-MM-dd' de la API → '3 oct 2026'.
 */
export const formatearFecha = (fechaIso) =>
    format(new Date(`${fechaIso}T00:00:00`), 'd MMM yyyy', { locale: es });

/**
 * Rango de un evento del calendario: '3 de octubre 2026' o '3 oct 2026 – 5 oct 2026'.
 */
export const formatearRangoEvento = (evento) => (isSameDay(evento.start, evento.end)
    ? format(evento.start, "d 'de' MMMM yyyy", { locale: es })
    : `${format(evento.start, 'd MMM yyyy', { locale: es })} – ${format(evento.end, 'd MMM yyyy', { locale: es })}`);

/**
 * Horario de un evento del calendario: '08:00 – 12:30' o 'Todo el día'.
 */
export const formatearHorarioEvento = (evento) => (evento.allDay
    ? 'Todo el día'
    : `${format(evento.start, 'HH:mm')} – ${format(evento.end, 'HH:mm')}`);
