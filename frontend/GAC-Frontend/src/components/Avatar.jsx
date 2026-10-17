const TAMANOS = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-24 w-24 text-2xl',
};

const iniciales = (nombre = '') =>
    nombre.trim().split(/\s+/).slice(0, 2).map((parte) => parte[0]?.toUpperCase() ?? '').join('') || '?';

/**
 * Foto de perfil redonda; si no hay foto muestra las iniciales del nombre.
 * Es decorativa: el nombre siempre aparece como texto junto a ella.
 */
export default function Avatar({ nombre, foto, tamano = 'md', className = '' }) {
    const clases = `${TAMANOS[tamano] ?? TAMANOS.md} shrink-0 rounded-full ${className}`;

    if (foto) {
        return <img src={foto} alt="" aria-hidden="true" className={`${clases} object-cover`} />;
    }

    return (
        <span aria-hidden="true" className={`${clases} inline-flex items-center justify-center bg-primary/15 text-primary font-semibold`}>
            {iniciales(nombre)}
        </span>
    );
}
