/** Etiqueta pequeña en mayúsculas + valor (muestra "—" si está vacío). */
export default function Dato({ label, value }) {
    return (
        <div>
            <p className="text-xs font-medium uppercase tracking-wide text-foreground-faint">{label}</p>
            <p className="text-sm text-foreground-soft truncate">{value || '—'}</p>
        </div>
    );
}
