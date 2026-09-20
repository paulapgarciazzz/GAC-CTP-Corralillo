import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import SelectorCategoriaBeneficio from './SelectorCategoriaBeneficio';
import FormularioBeneficio from './FormularioBeneficio';
import { BENEFICIO_CONFIG } from '../services/beneficioService';

export default function ModalBeneficio({ open, modo, categoriaInicial, beneficio, loading, error, errors, onClose, onSubmit, ocultarSelectorCategoria = false }) {
    const [categoria, setCategoria] = useState(categoriaInicial);

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={loading ? undefined : onClose}>
            <div role="dialog" aria-modal="true" aria-labelledby="titulo-modal-beneficio" onClick={(event) => event.stopPropagation()} className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-surface rounded-2xl shadow-2xl p-6 sm:p-8 relative">
                <button type="button" onClick={onClose} disabled={loading} aria-label="Cerrar" className="absolute top-4 right-4 text-foreground-faint hover:text-foreground disabled:opacity-50 transition-colors cursor-pointer">
                    <X size={22} />
                </button>
                <h2 id="titulo-modal-beneficio" className="text-xl sm:text-2xl text-center font-bold text-primary mb-6">
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
