import { startOfDay, setHours } from 'date-fns';
import { RANGE_START_HOUR, RANGE_END_HOUR } from './timeGrid';

// Un evento que termina justo a las 00:00 no ocupa ese último día.
const ultimoInstante = (event) => (event.end > event.start ? new Date(event.end.getTime() - 1) : event.end);

export function ocurreEnDia(event, day) {
    const dia = startOfDay(day);
    return startOfDay(event.start) <= dia && dia <= startOfDay(ultimoInstante(event));
}

// Recorta el evento al tramo visible de la grilla horaria para ese día,
// de modo que los eventos de varios días llenen la columna sin desbordarla.
export function segmentoDelDia(event, day) {
    const inicioVisible = setHours(startOfDay(day), RANGE_START_HOUR);
    const finVisible = setHours(startOfDay(day), RANGE_END_HOUR + 1);
    const start = event.start > inicioVisible ? event.start : inicioVisible;
    const end = event.end < finVisible ? event.end : finVisible;

    return { ...event, start, end: end > start ? end : start };
}
