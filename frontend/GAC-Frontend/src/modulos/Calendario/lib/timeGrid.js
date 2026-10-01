import { getHours, getMinutes, differenceInMinutes } from 'date-fns';

export const RANGE_START_HOUR = 6;
export const RANGE_END_HOUR = 21;
export const HOUR_HEIGHT = 64;

export const HOURS = Array.from(
    { length: RANGE_END_HOUR - RANGE_START_HOUR + 1 },
    (_, i) => RANGE_START_HOUR + i
);

export function topOffsetPx(event) {
    const minutesFromStart = (getHours(event.start) - RANGE_START_HOUR) * 60 + getMinutes(event.start);
    return Math.max((minutesFromStart / 60) * HOUR_HEIGHT, 0);
}

export function heightPx(event) {
    const minutes = differenceInMinutes(event.end, event.start);
    return Math.max((minutes / 60) * HOUR_HEIGHT, 24);
}
