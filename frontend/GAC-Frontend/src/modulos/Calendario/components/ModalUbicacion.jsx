import { useState } from 'react';
import { ImagePlus, MapPin, Trash2 } from 'lucide-react';
import ModalBase from './ModalBase';
import { AlertaError, BotonesFormulario, CampoFormulario } from './Formulario';
import { INPUT_CLASS } from '../lib/formulario';

export default function ModalUbicacion({ open, ubicacion, onClose, onGuardar }) {
    if (!open) return null;

    return (
        <FormularioUbicacion
            key={ubicacion?.id_ubicacion ?? 'nueva'}
            ubicacion={ubicacion}
            onClose={onClose}
            onGuardar={onGuardar}
        />
    );
}

function FormularioUbicacion({ ubicacion, onClose, onGuardar }) {
    const esEdicion = Boolean(ubicacion);
    const [valores, setValores] = useState({
        nombre: ubicacion?.nombre ?? '',
        capacidad: ubicacion?.capacidad ?? '',
        descripcion: ubicacion?.descripcion ?? '',
        imagen: ubicacion?.imagen ?? null,
    });
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');
    const [errores, setErrores] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setValores((prev) => ({ ...prev, [name]: value }));
    };

    const handleImagenChange = (e) => {
        const archivo = e.target.files?.[0];
        e.target.value = '';
        if (!archivo) return;

        if (!archivo.type.startsWith('image/')) {
            setError('El archivo seleccionado debe ser una imagen.');
            return;
        }

        setError('');
        const reader = new FileReader();
        reader.onload = () => {
            setValores((prev) => ({ ...prev, imagen: reader.result }));
        };
        reader.readAsDataURL(archivo);
    };

    const quitarImagen = () => {
        setValores((prev) => ({ ...prev, imagen: null }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const nombre = valores.nombre.trim();
        const capacidad = Number(valores.capacidad);
        if (!nombre || !Number.isInteger(capacidad) || capacidad < 1) {
            setError('El nombre y una capacidad mayor a 0 son obligatorios.');
            return;
        }

        setError('');
        setErrores({});
        setGuardando(true);
        const resultado = await onGuardar({
            nombre,
            capacidad,
            descripcion: valores.descripcion.trim() || null,
            imagen: valores.imagen,
        });
        setGuardando(false);

        if (!resultado.success) {
            setError(resultado.error);
            setErrores(resultado.errors ?? {});
        }
    };

    return (
        <ModalBase
            titulo={esEdicion ? 'Editar ubicación' : 'Agregar ubicación'}
            bloqueado={guardando}
            onClose={onClose}
        >
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div className="flex flex-col items-center gap-3">
                    <div className="w-full aspect-video rounded-xl bg-primary/10 border border-border overflow-hidden flex items-center justify-center">
                        {valores.imagen ? (
                            <img src={valores.imagen} alt="Vista previa de la ubicación" className="w-full h-full object-cover" />
                        ) : (
                            <MapPin size={40} className="text-primary/40" />
                        )}
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        <label
                            htmlFor="ubicacion-imagen"
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border border-primary text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                        >
                            <ImagePlus size={14} />
                            {valores.imagen ? 'Cambiar foto' : 'Agregar foto (opcional)'}
                        </label>
                        {valores.imagen && (
                            <button
                                type="button"
                                onClick={quitarImagen}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border border-danger/40 text-danger hover:bg-danger-soft transition-colors cursor-pointer"
                            >
                                <Trash2 size={14} />
                                Quitar foto
                            </button>
                        )}
                    </div>
                    <input id="ubicacion-imagen" type="file" accept="image/*" onChange={handleImagenChange} className="hidden" />
                    {errores.imagen && <p className="text-xs text-danger">{errores.imagen[0]}</p>}
                </div>

                <CampoFormulario id="ubicacion-nombre" label="Nombre" error={errores.nombre?.[0]}>
                    <input id="ubicacion-nombre" name="nombre" type="text" value={valores.nombre} onChange={handleChange} required maxLength={100} className={INPUT_CLASS} />
                </CampoFormulario>

                <CampoFormulario id="ubicacion-capacidad" label="Capacidad (personas)" error={errores.capacidad?.[0]}>
                    <input id="ubicacion-capacidad" name="capacidad" type="number" min="1" step="1" value={valores.capacidad} onChange={handleChange} required className={INPUT_CLASS} />
                </CampoFormulario>

                <CampoFormulario id="ubicacion-descripcion" label="Descripción (opcional)" error={errores.descripcion?.[0]}>
                    <textarea id="ubicacion-descripcion" name="descripcion" rows={3} value={valores.descripcion} onChange={handleChange} maxLength={1000} className={`${INPUT_CLASS} resize-y`} />
                </CampoFormulario>

                <AlertaError mensaje={error} />

                <BotonesFormulario
                    guardando={guardando}
                    textoEnviar={esEdicion ? 'Guardar cambios' : 'Agregar ubicación'}
                    onCancel={onClose}
                />
            </form>
        </ModalBase>
    );
}
