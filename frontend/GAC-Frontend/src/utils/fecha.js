export function formatearFecha(fecha) {
    if (!fecha) return null;
    const date = new Date(fecha);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString('es-CR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function obtenerFechaLocalISO() {
    const ahora = new Date();
    const anio = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const dia = String(ahora.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
}
