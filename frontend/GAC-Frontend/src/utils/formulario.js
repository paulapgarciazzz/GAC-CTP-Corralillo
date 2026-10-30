// Bordes con border-input (3:1) y foco visible: ver design-system/ctp-corralillo/MASTER.md.
export const INPUT_CLASS = 'w-full min-h-11 px-4 py-2 border border-border-input rounded-lg bg-surface text-foreground placeholder:text-foreground-faint transition-colors focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 aria-invalid:border-danger disabled:opacity-60 disabled:bg-surface-soft';

// La lista nativa de un <select> no hereda el tema: las opciones necesitan sus propios colores para verse en modo oscuro.
export const OPCION_CLASS = 'bg-surface text-foreground';

export const LABEL_CLASS = 'block text-sm font-semibold text-foreground';

const BOTON_BASE = 'w-full min-h-10 py-2 px-4 text-sm whitespace-nowrap rounded-lg font-semibold transition-colors duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed';

export const BOTON_SECUNDARIO_CLASS = `${BOTON_BASE} border border-border-input bg-surface text-foreground hover:bg-surface-soft`;

export const BOTON_PELIGRO_CLASS = `${BOTON_BASE} border border-danger/50 bg-surface text-danger hover:bg-danger-soft`;

export const BOTON_PRIMARIO_CLASS = `${BOTON_BASE} bg-primary hover:bg-primary-hover text-on-primary shadow-sm flex items-center justify-center gap-2`;
