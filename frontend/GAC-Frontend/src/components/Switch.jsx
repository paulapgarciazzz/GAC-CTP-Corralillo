/**
 * Interruptor accesible (role="switch"). El área táctil se amplía con un pseudo-elemento
 * para llegar a ~44px sin agrandar el control visible.
 */
export default function Switch({ checked, onChange, label, disabled = false, tamano = 'md' }) {
    const pequeno = tamano === 'sm';

    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            disabled={disabled}
            onClick={() => onChange(!checked)}
            className={`relative inline-flex shrink-0 items-center rounded-full transition-colors duration-200 motion-reduce:transition-none
                before:absolute before:-inset-2.5 before:content-['']
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface
                cursor-pointer disabled:cursor-not-allowed disabled:opacity-50
                ${pequeno ? 'h-5 w-9' : 'h-6 w-11'}
                ${checked ? 'bg-primary' : 'bg-foreground-faint/40'}`}
        >
            <span
                aria-hidden="true"
                className={`inline-block rounded-full bg-white shadow-sm transition-transform duration-200 motion-reduce:transition-none
                    ${pequeno ? 'h-4 w-4' : 'h-5 w-5'}
                    ${checked ? (pequeno ? 'translate-x-4.5' : 'translate-x-5.5') : 'translate-x-0.5'}`}
            />
        </button>
    );
}
