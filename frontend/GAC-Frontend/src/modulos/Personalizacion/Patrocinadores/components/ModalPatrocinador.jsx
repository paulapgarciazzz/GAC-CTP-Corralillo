import { useEffect, useState } from 'react';
import { Loader2, X } from 'lucide-react';

const CATEGORIAS = [
    { value: '', label: 'Sin categoría' },
    { value: 'principal', label: 'Principal' },
    { value: 'oro', label: 'Oro' },
    { value: 'plata', label: 'Plata' },
    { value: 'colaborador', label: 'Colaborador' },
];

const ESTADO_INICIAL = {
    nombre: '',
    descripcion: '',
    enlace: '',
    categoria: '',
    activo: true,
};

export default function ModalPatrocinador({ open, patrocinador, onClose, onGuardar }) {
    const [valores, setValores] = useState(ESTADO_INICIAL);
    const [logotipo, setLogotipo] = useState(null);
    const [previewLogotipo, setPreviewLogotipo] = useState('');
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!open) return;

        setValores(patrocinador
            ? {
                nombre: patrocinador.nombre,
                descripcion: patrocinador.descripcion ?? '',
                enlace: patrocinador.enlace ?? '',
                categoria: patrocinador.categoria ?? '',
                activo: patrocinador.activo,
            }
            : ESTADO_INICIAL);
        setLogotipo(null);
        setPreviewLogotipo(patrocinador?.logotipo_url ?? '');
        setError('');
    }, [open, patrocinador]);

    if (!open) return null;

    const actualizarCampo = (campo, valor) => setValores((prev) => ({ ...prev, [campo]: valor }));

    const seleccionarLogotipo = (event) => {
        const archivo = event.target.files?.[0];
        if (!archivo) return;
        setLogotipo(archivo);
        setPreviewLogotipo(URL.createObjectURL(archivo));
    };

    const enviar = async (event) => {
        event.preventDefault();

        if (!patrocinador && !logotipo) {
            setError('Selecciona un logotipo.');
            return;
        }

        setGuardando(true);
        setError('');

        const datos = { ...valores };
        if (logotipo) datos.logotipo = logotipo;

        const resultado = await onGuardar(datos);
        setGuardando(false);

        if (!resultado.success) setError(resultado.error);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={guardando ? undefined : onClose}>
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="titulo-modal-patrocinador"
                onClick={(event) => event.stopPropagation()}
                className="w-full max-w-lg bg-surface rounded-2xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto"
            >
                <button type="button" onClick={onClose} disabled={guardando} aria-label="Cerrar" className="absolute top-4 right-4 text-foreground-faint hover:text-foreground disabled:opacity-50 transition-colors cursor-pointer">
                    <X size={20} />
                </button>

                <h2 id="titulo-modal-patrocinador" className="text-lg font-bold text-foreground">
                    {patrocinador ? 'Editar patrocinador' : 'Agregar patrocinador'}
                </h2>

                <form onSubmit={enviar} className="mt-5 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground-soft mb-1">Nombre</label>
                        <input
                            type="text"
                            value={valores.nombre}
                            onChange={(event) => actualizarCampo('nombre', event.target.value)}
                            required
                            maxLength={150}
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground-soft mb-1">Logotipo</label>
                        <div className="flex items-center gap-3">
                            {previewLogotipo && (
                                <img src={previewLogotipo} alt="Vista previa del logotipo" className="h-16 w-16 object-contain rounded-lg border border-border bg-background p-1" />
                            )}
                            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={seleccionarLogotipo} className="text-sm text-foreground-soft" />
                        </div>
                        <p className="mt-1 text-xs text-foreground-faint">PNG, JPG o WEBP, máximo 2MB.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground-soft mb-1">Descripción (opcional)</label>
                        <textarea
                            value={valores.descripcion}
                            onChange={(event) => actualizarCampo('descripcion', event.target.value)}
                            maxLength={1000}
                            rows={3}
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground-soft mb-1">Enlace (opcional)</label>
                        <input
                            type="url"
                            value={valores.enlace}
                            onChange={(event) => actualizarCampo('enlace', event.target.value)}
                            placeholder="https://..."
                            maxLength={255}
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground-soft mb-1">Categoría (opcional)</label>
                        <select
                            value={valores.categoria}
                            onChange={(event) => actualizarCampo('categoria', event.target.value)}
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                        >
                            {CATEGORIAS.map((opcion) => (
                                <option key={opcion.value} value={opcion.value}>{opcion.label}</option>
                            ))}
                        </select>
                    </div>

                    <label className="flex items-center gap-2 text-sm text-foreground-soft">
                        <input
                            type="checkbox"
                            checked={valores.activo}
                            onChange={(event) => actualizarCampo('activo', event.target.checked)}
                            className="rounded border-border"
                        />
                        Visible en la landing
                    </label>

                    {error && <div role="alert" className="p-3 bg-danger-soft border border-danger/30 rounded-lg text-danger text-sm">{error}</div>}

                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} disabled={guardando} className="px-4 py-2 border border-border text-foreground-soft hover:bg-background disabled:opacity-50 rounded-lg font-medium transition-colors cursor-pointer">
                            Cancelar
                        </button>
                        <button type="submit" disabled={guardando} className="px-4 py-2 bg-primary hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors cursor-pointer flex items-center justify-center gap-2">
                            {guardando && <Loader2 size={16} className="animate-spin" />}
                            {guardando ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
