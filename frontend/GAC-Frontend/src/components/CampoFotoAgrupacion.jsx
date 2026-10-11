import { Trash2, Upload, Users } from 'lucide-react';

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
        const reader = new FileReader();
        reader.onload = () => onChange(reader.result);
        reader.readAsDataURL(archivo);
    };

    return (
        <div className="flex flex-col items-center gap-3">
            <div className="w-24 h-24 rounded-full bg-primary/10 border border-border overflow-hidden flex items-center justify-center">
                {fotoUrl ? (
                    <img src={fotoUrl} alt={alt} className="w-full h-full object-cover" />
                ) : (
                    <Users size={32} className="text-primary/40" />
                )}
            </div>
            <div className="flex items-center gap-2">
                <label
                    htmlFor={id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border border-primary text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                >
                    <Upload size={14} />
                    {fotoUrl ? 'Cambiar foto' : 'Agregar foto'}
                </label>
                {fotoUrl && (
                    <button
                        type="button"
                        onClick={() => { onChange(null); onError?.(''); }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border text-foreground-soft hover:text-danger hover:border-danger transition-colors cursor-pointer"
                    >
                        <Trash2 size={14} />
                        Quitar foto
                    </button>
                )}
            </div>
            <input id={id} name={id} type="file" accept="image/png,image/jpeg" onChange={handleFotoChange} className="hidden" />
            <p className="text-xs text-foreground-faint">Opcional. PNG o JPG, máximo 2MB.</p>
            {error && <p className="text-xs text-danger">{error}</p>}
        </div>
    );
}
