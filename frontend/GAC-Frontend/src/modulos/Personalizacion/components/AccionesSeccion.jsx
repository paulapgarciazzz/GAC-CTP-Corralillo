import { Loader2, RotateCcw, Save } from 'lucide-react';
import Aviso from '../../../components/Aviso';
import { BOTON_PRIMARIO_CLASS, BOTON_SECUNDARIO_CLASS } from '../../../utils/formulario';

/**
 * Mensajes + botones "Restaurar predeterminados" y "Guardar cambios".
 * Restaurar solo llena el formulario: los cambios se aplican al guardar.
 * Sin `puedeEditar` solo se muestran los mensajes.
 */
export default function AccionesSeccion({ puedeEditar, guardando, error, mensajeExito, onRestaurar, textoRestaurar = 'Restaurar textos predeterminados' }) {
    return (
        <div className="space-y-3">
            <Aviso tipo="exito" mensaje={mensajeExito} />
            <Aviso mensaje={error} />

            {puedeEditar && (
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
                    {onRestaurar && (
                        <button
                            type="button"
                            onClick={onRestaurar}
                            disabled={guardando}
                            title="Llena el formulario con los valores originales. Se aplican al guardar."
                            className={`${BOTON_SECUNDARIO_CLASS} inline-flex items-center justify-center gap-2 sm:w-auto sm:px-4`}
                        >
                            <RotateCcw size={16} />{textoRestaurar}
                        </button>
                    )}
                    <button type="submit" disabled={guardando} className={`${BOTON_PRIMARIO_CLASS} sm:w-auto sm:px-4`}>
                        {guardando ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {guardando ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                </div>
            )}
        </div>
    );
}
