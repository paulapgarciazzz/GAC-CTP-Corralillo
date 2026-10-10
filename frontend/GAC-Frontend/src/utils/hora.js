const MINUTOS_DIA = 24 * 60;

// "HH:mm" o "HH:mm:ss" → minutos transcurridos desde la medianoche.
export function aMinutos(valor) {
    return Number(valor.slice(0, 2)) * 60 + Number(valor.slice(3, 5));
}

/**
 * Devuelve una función que indica si un minuto del día (0-1439) cae dentro del rango, o `null` si no hay rango.
 * `hasta` es exclusivo (nulo = hasta el final del día). Si `hasta` <= `desde`, el rango cruza la medianoche.
 */
export function crearFiltroHora(desde, hasta) {
    if (!desde) return null;

    const inicio = aMinutos(desde);
    const fin = hasta ? aMinutos(hasta) : MINUTOS_DIA;
    return inicio < fin
        ? (minuto) => minuto >= inicio && minuto < fin
        : (minuto) => minuto >= inicio || minuto < fin;
}
