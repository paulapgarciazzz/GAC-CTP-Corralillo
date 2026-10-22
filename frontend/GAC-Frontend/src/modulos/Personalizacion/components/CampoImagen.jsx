import { useId, useState } from 'react';
import { ImagePlus, Loader2, RotateCcw } from 'lucide-react';
import { LABEL_CLASS } from '../../../utils/formulario';
import { esImagen } from '../../../utils/imagen';

const TIPOS_PERMITIDOS = ['image/png', 'image/jpeg', 'image/webp'];
const TAMANO_MAXIMO = 2 * 1024 * 1024;

/**
 * Imagen personalizable (escudo, logo): vista previa, subir una nueva y
 * restaurar la predeterminada. Se guarda al instante al elegir el archivo.
 */
export default function CampoImagen({ titulo, descripcion, url, urlPredeterminada, personalizada, etiquetaOrigen, puedeEditar, onSubir, onRestaurar, fondo = 'claro' }) {
    const id = useId();
    const [procesando, setProcesando] = useState(false);
    const [error, setError] = useState('');

    const seleccionar = async (e) => {
        const archivo = e.target.files?.[0];
        e.target.value = '';
        if (!archivo) return;

        if (!esImagen(archivo) || !TIPOS_PERMITIDOS.includes(archivo.type)) {
            setError('La imagen debe ser PNG, JPG o WEBP.');
            return;
        }
        if (archivo.size > TAMANO_MAXIMO) {
            setError('La imagen no debe superar los 2 MB.');
            return;
        }

        setError('');
        setProcesando(true);
        const resultado = await onSubir(archivo);
        setProcesando(false);
        if (!resultado.success) setError(resultado.error);
    };

    const restaurar = async () => {
        setError('');
        setProcesando(true);
        const resultado = await onRestaurar();
        setProcesando(false);
        if (!resultado.success) setError(resultado.error);
    };

    return (
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-center">
            <div className={`flex h-24 w-24 shrink-0 items-center justify-center rounded-lg border border-border p-2 ${fondo === 'oscuro' ? 'bg-rail' : 'bg-background'}`}>
                <img src={url || urlPredeterminada} alt={titulo} className="max-h-full max-w-full object-contain" />
            </div>

            <div className="min-w-0 flex-1 space-y-1">
                <p className={LABEL_CLASS}>{titulo}</p>
                {descripcion && <p className="text-sm text-foreground-soft">{descripcion}</p>}
                <p className="text-xs text-foreground-faint">
                    {etiquetaOrigen ?? (personalizada ? 'Imagen personalizada.' : 'Imagen original del colegio.')}
                </p>
                {error && <p className="text-xs text-danger">{error}</p>}
            </div>

            {puedeEditar && (
                <div className="flex flex-col gap-2 sm:items-end">
                    <label htmlFor={id} className={`inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover ${procesando ? 'pointer-events-none opacity-60' : 'cursor-pointer'}`}>
                        {procesando ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
                        Cambiar imagen
                    </label>
                    <input id={id} type="file" accept="image/png,image/jpeg,image/webp" onChange={seleccionar} disabled={procesando} className="sr-only" />
                    {personalizada && (
                        <button type="button" onClick={restaurar} disabled={procesando} className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground-soft transition-colors hover:bg-background disabled:opacity-60 cursor-pointer">
                            <RotateCcw size={16} />Restaurar predeterminada
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
