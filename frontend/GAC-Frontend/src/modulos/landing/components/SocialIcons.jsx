// lucide-react no incluye íconos de marcas (los retiró por temas de marca registrada),
// así que estos se definen como SVG inline mínimos en vez de imágenes generadas.

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

export function YouTubeIcon(props) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" {...props}>
            <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
            <path d="M10 9.2v5.6l4.8-2.8L10 9.2Z" fill="currentColor" stroke="none" />
        </svg>
    );
}

export function TikTokIcon(props) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
            <path d="M16.6 3c.3 2.2 1.6 3.6 3.9 3.8v3.1c-1.4.1-2.7-.3-3.9-1v6.1c0 3.6-2.7 6-5.9 6-3.3 0-5.8-2.6-5.4-6 .3-2.9 2.8-5 6.1-4.7v3.2c-1.4-.3-2.9.4-3.1 1.8-.2 1.4.9 2.6 2.3 2.6 1.4 0 2.4-1 2.4-2.6V3h3.6Z" />
        </svg>
    );
}

export function WhatsAppIcon(props) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" {...props}>
            <path d="M4 20l1.2-3.6A8 8 0 1 1 8 19l-4 1Z" strokeLinejoin="round" />
            <path d="M9.2 8.6c.2-.4.6-.4.8-.1l.8 1.6c.1.3 0 .5-.2.7l-.4.4c.5 1 1.3 1.8 2.3 2.3l.4-.4c.2-.2.5-.3.7-.2l1.6.8c.3.2.3.6-.1.8-.6.5-1.4.7-2.2.4-1.9-.7-3.4-2.2-4.1-4.1-.3-.8-.1-1.6.4-2.2Z" fill="currentColor" stroke="none" />
        </svg>
    );
}
