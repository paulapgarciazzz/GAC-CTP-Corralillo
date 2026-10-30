// Apariencia común de los modales (ModalBase y los que arman su propio overlay).
export const MODAL_OVERLAY_CLASS = 'fixed inset-0 z-50 flex items-center justify-center bg-rail/60 p-4 animate-aparecer';

// El panel recibe el foco al abrirse (tabIndex -1), por eso no muestra outline.
export const MODAL_PANEL_CLASS = 'relative w-full bg-surface border border-border rounded-2xl shadow-xl animate-entrada focus:outline-none';

export const BOTON_CERRAR_MODAL_CLASS = 'absolute top-3 right-3 inline-flex h-10 w-10 items-center justify-center rounded-lg text-foreground-faint hover:bg-surface-soft hover:text-foreground disabled:opacity-50 transition-colors cursor-pointer';
