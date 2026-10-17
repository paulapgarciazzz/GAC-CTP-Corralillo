import FormularioEventoNuevo from './FormularioEventoNuevo';
import ModalBase from './ModalBase';

/**
 * `onDelete(evento)` es opcional: sin él no se muestra el botón Eliminar.
 * La confirmación la maneja quien abre el modal.
 */
export default function ModalCrearEvento({ open, evento, onClose, onCreate, onUpdate, onDelete }){
    if (!open) return null;

    const eventoId = evento?.id;

    const handleSubmit = async (datos) => {
        const resultado = evento ? await onUpdate(eventoId, datos) : await onCreate(datos);
        if (resultado?.success) onClose();
        return resultado;
    };

    return (
        <ModalBase titulo={evento ? 'Editar evento' : 'Crear evento'} onClose={onClose}>
            <FormularioEventoNuevo
                evento={evento}
                onSubmit={handleSubmit}
                onCancel={onClose}
                onDelete={evento && onDelete ? () => onDelete(evento) : undefined}
            />
        </ModalBase>
    );
}
