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
