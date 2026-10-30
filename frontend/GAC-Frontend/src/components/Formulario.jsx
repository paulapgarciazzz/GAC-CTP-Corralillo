import { cloneElement, isValidElement } from 'react';
import { Loader2 } from 'lucide-react';
import { BOTON_PRIMARIO_CLASS, BOTON_SECUNDARIO_CLASS, LABEL_CLASS } from '../utils/formulario';
import Aviso from './Aviso';

/**
 * Etiqueta + control + mensaje de error del backend (errors[campo][0]).
 * Con error, el control queda marcado con aria-invalid y enlazado al mensaje.
 */
export function CampoFormulario({ id, label, error, className = '', children }) {
    const idError = `${id}-error`;
    const control = error && isValidElement(children)
        ? cloneElement(children, { 'aria-invalid': true, 'aria-describedby': idError })
        : children;

    return (
        <div className={`space-y-1.5 ${className}`}>
            <label htmlFor={id} className={LABEL_CLASS}>{label}</label>
            {control}
            {error && <p id={idError} className="text-sm text-danger">{error}</p>}
        </div>
    );
}

export function AlertaError({ mensaje }) {
    return <Aviso tipo="error" mensaje={mensaje} />;
}

/**
 * Botones Cancelar + Enviar. En celular se apilan (enviar arriba); desde `sm` van en fila.
 * `children` permite agregar acciones extra a la izquierda (p. ej. Eliminar).
 */
export function BotonesFormulario({ guardando, textoEnviar, textoGuardando = 'Guardando...', deshabilitarEnviar = false, onCancel, children }) {
    return (
        <div className="flex flex-col-reverse sm:flex-row sm:items-center gap-3 pt-2">
            {children}
            <button type="button" onClick={onCancel} disabled={guardando} className={BOTON_SECUNDARIO_CLASS}>
                Cancelar
            </button>
            <button type="submit" disabled={guardando || deshabilitarEnviar} className={BOTON_PRIMARIO_CLASS}>
                {guardando && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
                {guardando ? textoGuardando : textoEnviar}
            </button>
        </div>
    );
}
