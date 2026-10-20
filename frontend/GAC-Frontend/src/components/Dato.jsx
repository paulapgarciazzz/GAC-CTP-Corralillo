/** Etiqueta pequeña en mayúsculas + valor (muestra "—" si está vacío). */
export default function Dato({ label, value }) {
    return (
        <div>
            <p className="text-[11px] uppercase tracking-wider text-foreground-faint">{label}</p>
            <p className="text-sm text-foreground-soft truncate">{value || '—'}</p>
        </div>
    );
}
