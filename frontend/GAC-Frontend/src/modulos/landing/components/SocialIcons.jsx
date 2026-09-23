// lucide-react no incluye íconos de marcas (los retiró por temas de marca registrada),
// así que estos dos se definen como SVG inline mínimos en vez de imágenes generadas.

export function FacebookIcon(props) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
            <path d="M13.5 21v-7.5h2.5l.5-3H13.5V8.5c0-.9.25-1.5 1.55-1.5H16.6V4.3C16.3 4.26 15.3 4.17 14.13 4.17c-2.42 0-4.08 1.48-4.08 4.2V10.5H7.5v3H10v7.5h3.5Z" />
        </svg>
    );
}

export function InstagramIcon(props) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" {...props}>
            <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
        </svg>
    );
}
