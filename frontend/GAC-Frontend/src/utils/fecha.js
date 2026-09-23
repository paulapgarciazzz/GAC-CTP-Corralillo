export function formatearFecha(fecha) {
    if (!fecha) return null;
    const date = new Date(fecha);
    if (Number.isNaN(date.getTime())) return null;
    const dia = String(date.getUTCDate()).padStart(2, '0');
    const mes = String(date.getUTCMonth() + 1).padStart(2, '0');
    const anio = date.getUTCFullYear();
    return `${dia}/${mes}/${anio}`;
}

export function obtenerFechaLocalISO() {
    const ahora = new Date();
    const anio = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const dia = String(ahora.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
}

const formatearISOLocal = (date) => {
    const anio = date.getFullYear();
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const dia = String(date.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
};

/**
 * Construye un Date a partir de un string "YYYY-MM-DD" usando componentes
 * locales (no new Date(string), que Chrome/V8 interpreta como UTC medianoche
 * y puede mostrar el día anterior en zonas horarias detrás de UTC).
 */
function fechaLocalDesdeISO(fechaISO) {
    const [anio, mes, dia] = fechaISO.split('-').map(Number);
    return new Date(anio, mes - 1, dia);
}

/**
 * Dada una fecha (YYYY-MM-DD), calcula el lunes y domingo de esa semana,
 * en horario local, sin pasar por UTC.
 */
export function calcularRangoSemana(fechaISO) {
    const fecha = fechaLocalDesdeISO(fechaISO);
    const diaSemana = fecha.getDay();
    const offsetLunes = diaSemana === 0 ? -6 : 1 - diaSemana;

    const lunes = new Date(fecha);
    lunes.setDate(fecha.getDate() + offsetLunes);

    const domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() + 6);

    return {
        desde: formatearISOLocal(lunes),
        hasta: formatearISOLocal(domingo),
    };
}

/**
 * Dado un mes (YYYY-MM), calcula el primer y último día del mes.
 */
export function calcularRangoMes(mesISO) {
    const [anio, mes] = mesISO.split('-').map(Number);
    const primerDia = new Date(anio, mes - 1, 1);
    const ultimoDia = new Date(anio, mes, 0);

    return {
        desde: formatearISOLocal(primerDia),
        hasta: formatearISOLocal(ultimoDia),
    };
}
