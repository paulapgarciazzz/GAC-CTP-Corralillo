import { useEffect, useId, useState } from 'react';
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Trash2 } from 'lucide-react';
import Aviso from '../../../components/Aviso';
import Switch from '../../../components/Switch';
import ModalConfirmarEliminacion from '../../../components/ModalConfirmarEliminacion';
import { EstadoCargando, EstadoVacio } from '../../../components/EstadoLista';
import { useConfirmarEliminacion } from '../../../hooks/useConfirmarEliminacion';
import { INPUT_CLASS } from '../../../utils/formulario';
import { esImagen } from '../../../utils/imagen';
import { usePersonalizacion } from '../publico/usePersonalizacion';
import {
    actualizarFoto,
    crearFoto,
    eliminarFoto,
    obtenerFotos,
    reordenarFotos,
} from '../services/personalizacionService';

const TIPOS_PERMITIDOS = ['image/png', 'image/jpeg', 'image/webp'];
const TAMANO_MAXIMO = 4 * 1024 * 1024;

/**
 * Fotos de un destino ('hero' o 'galeria'): subir, activar/ocultar, título,
 * orden y eliminar. Cada acción respeta su permiso de personalizacion.*.
 */
export default function GestorFotos({ destino, textoVacio, puedeCrear, puedeEditar, puedeEliminar }) {
    const idArchivo = useId();
    const { recargar } = usePersonalizacion();
    const [fotos, setFotos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [subiendo, setSubiendo] = useState(false);
    const [tituloNuevo, setTituloNuevo] = useState('');
    const [error, setError] = useState('');
    const [mensajeExito, setMensajeExito] = useState('');

    const mostrarExito = (mensaje) => {
        setMensajeExito(mensaje);
        window.setTimeout(() => setMensajeExito(''), 3500);
        recargar();
    };

    const eliminacion = useConfirmarEliminacion(
        (foto) => eliminarFoto(foto.id_foto),
        (foto) => {
            setFotos((prev) => prev.filter((item) => item.id_foto !== foto.id_foto));
            mostrarExito('Foto eliminada correctamente.');
        },
    );

    useEffect(() => {
        let activo = true;

        obtenerFotos(destino).then((resultado) => {
            if (!activo) return;
            if (resultado.success) setFotos(resultado.data);
            else setError(resultado.error);
            setCargando(false);
        });

        return () => {
            activo = false;
        };
    }, [destino]);

    const reemplazar = (foto) => setFotos((prev) => prev.map((item) => (item.id_foto === foto.id_foto ? foto : item)));

    const subir = async (e) => {
        const archivo = e.target.files?.[0];
        e.target.value = '';
        if (!archivo) return;

        if (!esImagen(archivo) || !TIPOS_PERMITIDOS.includes(archivo.type)) {
            setError('La foto debe ser PNG, JPG o WEBP.');
            return;
        }
        if (archivo.size > TAMANO_MAXIMO) {
            setError('La foto no debe superar los 4 MB.');
            return;
        }

        setError('');
        setSubiendo(true);
        const resultado = await crearFoto(destino, archivo, tituloNuevo.trim());
        setSubiendo(false);

        if (resultado.success) {
            setFotos((prev) => [...prev, resultado.data]);
            setTituloNuevo('');
            mostrarExito('Foto agregada correctamente.');
        } else {
            setError(resultado.error);
        }
    };

    const guardarCambio = async (foto, datos, mensaje) => {
        setError('');
        const resultado = await actualizarFoto(foto.id_foto, datos);
        if (resultado.success) {
            reemplazar(resultado.data);
            if (mensaje) mostrarExito(mensaje);
        } else {
            setError(resultado.error);
        }
    };

    const guardarTitulo = (foto, titulo) => {
        const limpio = titulo.trim();
        if (limpio === (foto.titulo ?? '')) return;
        guardarCambio(foto, { titulo: limpio || '' }, 'Título actualizado.');
    };

    const mover = async (indice, paso) => {
        const destinoIndice = indice + paso;
        if (destinoIndice < 0 || destinoIndice >= fotos.length) return;

        const reordenadas = [...fotos];
        [reordenadas[indice], reordenadas[destinoIndice]] = [reordenadas[destinoIndice], reordenadas[indice]];
        const conOrden = reordenadas.map((item, orden) => ({ ...item, orden }));
        const anteriores = fotos;

        setFotos(conOrden);
        setError('');
        const resultado = await reordenarFotos(conOrden.map(({ id_foto, orden }) => ({ id_foto, orden })));
        if (resultado.success) {
            recargar();
        } else {
            setFotos(anteriores);
            setError(resultado.error);
        }
    };

    if (cargando) return <EstadoCargando texto="Cargando fotos..." />;

    return (
        <div className="space-y-4">
            {puedeCrear && (
                <div className="flex flex-col gap-3 rounded-xl border border-dashed border-border bg-surface p-4 sm:flex-row sm:items-center">
                    <input
                        type="text"
                        value={tituloNuevo}
                        onChange={(e) => setTituloNuevo(e.target.value)}
                        maxLength={150}
                        placeholder="Título o descripción (opcional)"
                        aria-label="Título de la nueva foto"
                        className={INPUT_CLASS}
                    />
                    <label htmlFor={idArchivo} className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-hover ${subiendo ? 'pointer-events-none opacity-60' : 'cursor-pointer'}`}>
                        {subiendo ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
                        {subiendo ? 'Subiendo...' : 'Subir foto'}
                    </label>
                    <input id={idArchivo} type="file" accept="image/png,image/jpeg,image/webp" onChange={subir} disabled={subiendo} className="sr-only" />
                </div>
            )}

            <Aviso tipo="exito" mensaje={mensajeExito} />
            <Aviso mensaje={error} />

            {fotos.length === 0 ? (
                <EstadoVacio mensaje={textoVacio} />
            ) : (
                <ul className="space-y-2">
                    {fotos.map((foto, indice) => (
                        <li key={foto.id_foto} className={`flex flex-col gap-3 rounded-xl border border-border bg-surface p-3 sm:flex-row sm:items-center ${foto.activo ? '' : 'opacity-70'}`}>
                            <img src={foto.url} alt={foto.titulo ?? ''} className="h-20 w-full shrink-0 rounded-lg object-cover sm:w-32" />

                            <input
                                type="text"
                                defaultValue={foto.titulo ?? ''}
                                onBlur={(e) => guardarTitulo(foto, e.target.value)}
                                maxLength={150}
                                placeholder="Sin título"
                                aria-label="Título de la foto"
                                disabled={!puedeEditar}
                                className={INPUT_CLASS}
                            />

                            <div className="flex items-center justify-between gap-3 sm:justify-end">
                                <div className="flex items-center gap-2 text-xs text-foreground-soft">
                                    <Switch
                                        tamano="sm"
                                        checked={foto.activo}
                                        onChange={(activo) => guardarCambio(foto, { activo }, activo ? 'Foto visible en la landing.' : 'Foto oculta en la landing.')}
                                        label={foto.activo ? 'Ocultar foto' : 'Mostrar foto'}
                                        disabled={!puedeEditar}
                                    />
                                    {foto.activo ? 'Visible' : 'Oculta'}
                                </div>

                                <div className="flex items-center gap-1">
                                    {puedeEditar && (
                                        <>
                                            <button type="button" onClick={() => mover(indice, -1)} disabled={indice === 0} aria-label="Subir en el orden" className="rounded-lg p-2 text-foreground-soft hover:bg-background disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed">
                                                <ArrowUp size={16} />
                                            </button>
                                            <button type="button" onClick={() => mover(indice, 1)} disabled={indice === fotos.length - 1} aria-label="Bajar en el orden" className="rounded-lg p-2 text-foreground-soft hover:bg-background disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed">
                                                <ArrowDown size={16} />
                                            </button>
                                        </>
                                    )}
                                    {puedeEliminar && (
                                        <button type="button" onClick={() => eliminacion.abrir(foto)} aria-label="Eliminar foto" className="rounded-lg p-2 text-danger hover:bg-danger-soft cursor-pointer">
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            <ModalConfirmarEliminacion
                open={Boolean(eliminacion.elemento)}
                titulo="Eliminar foto"
                nombre={eliminacion.elemento?.titulo || 'esta foto'}
                textoBoton="Eliminar foto"
                loading={eliminacion.eliminando}
                error={eliminacion.error}
                onClose={eliminacion.cerrar}
                onConfirm={eliminacion.confirmar}
            />
        </div>
    );
}
