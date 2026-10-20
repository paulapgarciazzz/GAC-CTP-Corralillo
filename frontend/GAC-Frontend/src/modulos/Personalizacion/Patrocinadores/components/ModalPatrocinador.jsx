import { useState } from 'react';
import { ImagePlus } from 'lucide-react';
import ModalBase from '../../../../components/ModalBase';
import Switch from '../../../../components/Switch';
import { AlertaError, BotonesFormulario, CampoFormulario } from '../../../../components/Formulario';
import { INPUT_CLASS, LABEL_CLASS } from '../../../../utils/formulario';
import { leerComoDataURL } from '../../../../utils/archivo';
import { esImagen } from '../../../../utils/imagen';
import { CATEGORIAS } from '../lib/categorias';

export default function ModalPatrocinador({ open, patrocinador, onClose, onGuardar }) {
    if (!open) return null;

    return (
        <FormularioPatrocinador
            key={patrocinador?.id_patrocinador ?? 'nuevo'}
            patrocinador={patrocinador}
            onClose={onClose}
            onGuardar={onGuardar}
        />
    );
}

function FormularioPatrocinador({ patrocinador, onClose, onGuardar }) {
    const esEdicion = Boolean(patrocinador);
    const [valores, setValores] = useState({
        nombre: patrocinador?.nombre ?? '',
        descripcion: patrocinador?.descripcion ?? '',
        enlace: patrocinador?.enlace ?? '',
        categoria: patrocinador?.categoria ?? '',
        activo: patrocinador?.activo ?? true,
    });
    // El logotipo se sube como archivo (Storage); la vista previa es solo local.
    const [logotipo, setLogotipo] = useState(null);
    const [previewLogotipo, setPreviewLogotipo] = useState(patrocinador?.logotipo_url ?? '');
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');
    const [errores, setErrores] = useState({});

    const actualizarCampo = (campo, valor) => setValores((prev) => ({ ...prev, [campo]: valor }));

    const handleChange = (e) => actualizarCampo(e.target.name, e.target.value);

    const seleccionarLogotipo = (e) => {
        const archivo = e.target.files?.[0];
        e.target.value = '';
        if (!archivo) return;

        if (!esImagen(archivo)) {
            setError('El archivo seleccionado debe ser una imagen.');
            return;
        }

        setError('');
        setLogotipo(archivo);
        leerComoDataURL(archivo)
            .then(setPreviewLogotipo)
            .catch((err) => setError(err.message));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!valores.nombre.trim()) {
            setError('El nombre es obligatorio.');
            return;
        }
        if (!esEdicion && !logotipo) {
            setError('Selecciona un logotipo.');
            return;
        }

        setError('');
        setErrores({});
        setGuardando(true);
        const resultado = await onGuardar({
            ...valores,
            nombre: valores.nombre.trim(),
            ...(logotipo && { logotipo }),
        });
        setGuardando(false);

        if (!resultado.success) {
            setError(resultado.error);
            setErrores(resultado.errors ?? {});
        }
    };

    return (
        <ModalBase
            titulo={esEdicion ? 'Editar patrocinador' : 'Agregar patrocinador'}
            bloqueado={guardando}
            onClose={onClose}
        >
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div className="flex flex-col items-center gap-3">
                    <div className="h-24 w-24 rounded-xl border border-border bg-background overflow-hidden flex items-center justify-center">
                        {previewLogotipo ? (
                            <img src={previewLogotipo} alt="Vista previa del logotipo" className="h-full w-full object-contain p-1" />
                        ) : (
                            <ImagePlus size={32} className="text-primary/40" />
                        )}
                    </div>
                    <label
                        htmlFor="patrocinador-logotipo"
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border border-primary text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                    >
                        <ImagePlus size={14} />
                        {previewLogotipo ? 'Cambiar logotipo' : 'Agregar logotipo'}
                    </label>
                    <input id="patrocinador-logotipo" type="file" accept="image/png,image/jpeg,image/webp" onChange={seleccionarLogotipo} className="hidden" />
                    <p className="text-xs text-foreground-faint">PNG, JPG o WEBP, máximo 2MB.</p>
                    {errores.logotipo && <p className="text-xs text-danger">{errores.logotipo[0]}</p>}
                </div>

                <CampoFormulario id="patrocinador-nombre" label="Nombre" error={errores.nombre?.[0]}>
                    <input id="patrocinador-nombre" name="nombre" type="text" value={valores.nombre} onChange={handleChange} required maxLength={150} className={INPUT_CLASS} />
                </CampoFormulario>

                <CampoFormulario id="patrocinador-descripcion" label="Descripción (opcional)" error={errores.descripcion?.[0]}>
                    <textarea id="patrocinador-descripcion" name="descripcion" rows={3} value={valores.descripcion} onChange={handleChange} maxLength={1000} className={`${INPUT_CLASS} resize-y`} />
                </CampoFormulario>

                <CampoFormulario id="patrocinador-enlace" label="Enlace (opcional)" error={errores.enlace?.[0]}>
                    <input id="patrocinador-enlace" name="enlace" type="url" value={valores.enlace} onChange={handleChange} placeholder="https://..." maxLength={255} className={INPUT_CLASS} />
                </CampoFormulario>

                <CampoFormulario id="patrocinador-categoria" label="Categoría (opcional)" error={errores.categoria?.[0]}>
                    <select id="patrocinador-categoria" name="categoria" value={valores.categoria} onChange={handleChange} className={INPUT_CLASS}>
                        <option value="">Sin categoría</option>
                        {CATEGORIAS.map((categoria) => (
                            <option key={categoria.value} value={categoria.value}>{categoria.label}</option>
                        ))}
                    </select>
                </CampoFormulario>

                <div className="flex items-center justify-between gap-3">
                    <span className={LABEL_CLASS}>Visible en la landing</span>
                    <Switch checked={valores.activo} onChange={(activo) => actualizarCampo('activo', activo)} label="Visible en la landing" />
                </div>

                <AlertaError mensaje={error} />

                <BotonesFormulario
                    guardando={guardando}
                    textoEnviar={esEdicion ? 'Guardar cambios' : 'Agregar patrocinador'}
                    onCancel={onClose}
                />
            </form>
        </ModalBase>
    );
}
