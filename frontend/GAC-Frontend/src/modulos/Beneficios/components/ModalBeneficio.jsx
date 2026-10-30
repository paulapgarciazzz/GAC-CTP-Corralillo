import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { useAtraparFoco } from '../../../hooks/useAtraparFoco';
import { BOTON_CERRAR_MODAL_CLASS, MODAL_OVERLAY_CLASS, MODAL_PANEL_CLASS } from '../../../utils/modal';
import SelectorCategoriaBeneficio from './SelectorCategoriaBeneficio';
import FormularioBeneficio from './FormularioBeneficio';
import { BENEFICIO_CONFIG } from '../services/beneficioService';

export default function ModalBeneficio({ open, modo, categoriaInicial, beneficio, loading, error, errors, onClose, onSubmit, ocultarSelectorCategoria = false }) {
    const [categoria, setCategoria] = useState(categoriaInicial);

    const panelRef = useRef(null);
    useAtraparFoco(open, panelRef);

    useEffect(() => {
        if (!open) return undefined;
        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && !loading) onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [open, loading, onClose]);

    if (!open) return null;

    const editando = modo === 'editar';

    return (
        <div className={MODAL_OVERLAY_CLASS} onClick={loading ? undefined : onClose}>
            <div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="titulo-modal-beneficio" tabIndex={-1} onClick={(event) => event.stopPropagation()} className={`${MODAL_PANEL_CLASS} max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8`}>
                <button type="button" onClick={onClose} disabled={loading} aria-label="Cerrar" className={BOTON_CERRAR_MODAL_CLASS}>
                    <X size={20} aria-hidden="true" />
                </button>
                <h2 id="titulo-modal-beneficio" className="text-xl sm:text-2xl text-center font-semibold text-foreground mb-6 px-8">
                    {editando ? 'Editar beneficio' : 'Agregar beneficio'}
                </h2>

                <div className="space-y-2 mb-6">
                    {ocultarSelectorCategoria ? (
                        <p className="text-sm font-medium text-foreground-soft">{BENEFICIO_CONFIG[categoria].label}</p>
                    ) : (
                        <>
                            <p className="text-xs font-medium text-foreground-soft uppercase tracking-wider">Tipo de beneficio</p>
                            <SelectorCategoriaBeneficio value={categoria} onChange={setCategoria} disabled={editando || loading} />
                        </>
                    )}
                </div>

                <FormularioBeneficio
                    key={`${categoria}-${beneficio?.[Object.keys(beneficio ?? {})[0]] ?? 'nuevo'}`}
                    categoria={categoria}
                    beneficio={beneficio}
                    loading={loading}
                    error={error}
                    errors={errors}
                    onSubmit={(payload) => onSubmit(categoria, payload)}
                />
            </div>
        </div>
    );
}
