export const INPUT_CLASS = 'w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60';

export const LABEL_CLASS = 'text-xs font-medium text-foreground-soft uppercase tracking-wider block';

const BOTON_BASE = 'w-full py-2 px-3 text-sm whitespace-nowrap rounded-lg font-semibold transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed';

export const BOTON_SECUNDARIO_CLASS = `${BOTON_BASE} border border-border text-foreground-soft hover:bg-surface-soft`;

export const BOTON_PELIGRO_CLASS = `${BOTON_BASE} border border-danger/40 text-danger hover:bg-danger-soft`;

export const BOTON_PRIMARIO_CLASS = `${BOTON_BASE} bg-primary hover:bg-primary-hover text-white flex items-center justify-center gap-2`;
