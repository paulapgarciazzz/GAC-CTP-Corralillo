import { Trash2, Upload, Users } from 'lucide-react';
import { leerComoDataURL } from '../utils/archivo';

const TIPOS_FOTO_ACEPTADOS = ['image/png', 'image/jpeg'];
const TAMANO_MAXIMO_FOTO = 2 * 1024 * 1024;

export default function CampoFotoAgrupacion({ id = 'foto_url', fotoUrl, alt = 'Foto de la agrupación', onChange, onError, error }) {
    const handleFotoChange = (e) => {
        const archivo = e.target.files?.[0];
        e.target.value = '';
        if (!archivo) return;

        if (!TIPOS_FOTO_ACEPTADOS.includes(archivo.type)) {
            onError?.('La foto debe ser una imagen PNG o JPG.');
            return;
        }
        if (archivo.size > TAMANO_MAXIMO_FOTO) {
            onError?.('La foto no debe superar 2MB.');
            return;
        }

        onError?.('');
        leerComoDataURL(archivo)
            .then(onChange)
            .catch((err) => onError?.(err.message));
    };

    return (
        <div className="flex flex-col items-center gap-3">
            <div className="w-24 h-24 rounded-full bg-surface-soft border border-border overflow-hidden flex items-center justify-center">
                {fotoUrl ? (
                    <img src={fotoUrl} alt={alt} className="w-full h-full object-cover" />
                ) : (
                    <Users size={32} className="text-foreground-faint" aria-hidden="true" />
                )}
            </div>
            {/* El input va antes de la etiqueta y oculto solo visualmente: así es alcanzable con Tab y el foco se ve en la etiqueta. */}
            <input id={id} name={id} type="file" accept="image/png,image/jpeg" onChange={handleFotoChange} aria-describedby={`${id}-ayuda${error ? ` ${id}-error` : ''}`} className="peer sr-only" />
            <div className="flex items-center gap-2 peer-focus-visible:[&>label]:outline-2 peer-focus-visible:[&>label]:outline-offset-2 peer-focus-visible:[&>label]:outline-primary">
                <label
                    htmlFor={id}
                    className="flex min-h-9 items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold border border-primary text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                >
                    <Upload size={14} aria-hidden="true" />
                    {fotoUrl ? 'Cambiar foto' : 'Agregar foto'}
                </label>
                {fotoUrl && (
                    <button
                        type="button"
                        onClick={() => { onChange(null); onError?.(''); }}
                        className="flex min-h-9 items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold border border-border-input text-foreground-soft hover:text-danger hover:border-danger transition-colors cursor-pointer"
                    >
                        <Trash2 size={14} aria-hidden="true" />
                        Quitar foto
                    </button>
                )}
            </div>
            <p id={`${id}-ayuda`} className="text-xs text-foreground-faint">Opcional. PNG o JPG, máximo 2MB.</p>
            {error && <p id={`${id}-error`} className="text-sm text-danger">{error}</p>}
        </div>
    );
}
