import { Printer } from 'lucide-react';

/**
 * Abre el diálogo de impresión del navegador (permite "Guardar como PDF").
 * No aparece en la hoja impresa.
 */
export default function BotonImprimir({ texto = 'Imprimir' }) {
    return (
        <button
            type="button"
            onClick={() => window.print()}
            className="print:hidden flex items-center gap-2 px-3 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors cursor-pointer"
        >
            <Printer size={16} />
            {texto}
        </button>
    );
}
