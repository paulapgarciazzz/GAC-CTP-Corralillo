import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { INPUT_CLASS } from '../../Calendario/lib/formulario';

/**
 * Input de contraseña con botón para mostrarla u ocultarla.
 * Recibe los mismos props que un <input> (id, value, onChange, autoComplete…).
 */
export default function CampoPassword({ className = '', ...props }) {
    const [visible, setVisible] = useState(false);

    return (
        <div className="relative">
            <input {...props} type={visible ? 'text' : 'password'} className={`${INPUT_CLASS} pr-11 ${className}`} />
            <button type="button" onClick={() => setVisible((v) => !v)}
                aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 inline-flex items-center justify-center rounded-md text-foreground-faint hover:text-foreground transition-colors cursor-pointer">
                {visible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
        </div>
    );
}
