import { BENEFICIO_CONFIG } from '../services/beneficioService';

export default function SelectorCategoriaBeneficio({ value, onChange, disabled = false }) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.entries(BENEFICIO_CONFIG).filter(([, config]) => !config.oculto).map(([categoria, config]) => (
                <button
                    key={categoria}
                    type="button"
                    disabled={disabled}
                    onClick={() => onChange(categoria)}
                    className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${
                        value === categoria
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border text-foreground-soft hover:bg-primary/5'
                    }`}
                >
                    {config.label}
                </button>
            ))}
        </div>
    );
}
