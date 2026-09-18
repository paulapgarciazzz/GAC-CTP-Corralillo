import { useEffect, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import SeccionCategoriaAsignacion from './SeccionCategoriaAsignacion';
import ResumenAsignacion from './ResumenAsignacion';
import { obtenerBeneficios } from '../services/beneficioService';

const CATEGORIAS = [
    { key: 'mobiliarios', catalogoKey: 'mobiliario', titulo: 'Mobiliario', campoId: 'id_mobiliario', tieneCantidad: true },
    { key: 'alimentaciones', catalogoKey: 'alimentacion', titulo: 'Alimentación', campoId: 'id_alimentacion', tieneCantidad: false, cantidadAutomatica: true },
    { key: 'aulas', catalogoKey: 'aula', titulo: 'Aula', campoId: 'id_aula', tieneCantidad: false },
    { key: 'transportes', catalogoKey: null, titulo: 'Transporte', tieneCantidad: false },
];

const FILA_VACIA = {
    mobiliarios: { id_mobiliario: '', cantidad: '' },
    alimentaciones: { id_alimentacion: '' },
    aulas: { id_aula: '' },
    transportes: { matricula: '', id_ruta: '' },
};

const ETIQUETA_POR_CATALOGO = {
    mobiliario: (item) => item.nombre,
    alimentacion: (item) => item.tiempo_comida,
    aula: (item) => `${item.nombre} (capacidad ${item.capacidad})`,
};

const filasIniciales = (asignacion) => ({
    mobiliarios: (asignacion?.mobiliarios ?? []).map((m) => ({ id_mobiliario: String(m.id_mobiliario), cantidad: String(m.cantidad) })),
    alimentaciones: (asignacion?.alimentaciones ?? []).map((a) => ({ id_alimentacion: String(a.id_alimentacion) })),
    aulas: (asignacion?.aulas ?? []).map((a) => ({ id_aula: String(a.id_aula) })),
    transportes: (asignacion?.transportes ?? []).map((t) => ({ matricula: t.matricula, id_ruta: String(t.id_ruta) })),
});

const construirCampos = (categoria, catalogos) => {
    if (categoria.key === 'transportes') {
        return [
            {
                nombre: 'matricula',
                etiqueta: 'Vehículo',
                opciones: (catalogos.transporte ?? []).map((t) => ({ value: t.matricula, label: `${t.matricula} - ${t.tipo}` })),
            },
            {
                nombre: 'id_ruta',
                etiqueta: 'Ruta',
                opciones: (catalogos.ruta ?? []).map((r) => ({ value: String(r.id_ruta), label: r.nombre_ruta })),
            },
        ];
    }

    const catalogo = catalogos[categoria.catalogoKey] ?? [];
    const etiquetaDe = ETIQUETA_POR_CATALOGO[categoria.catalogoKey];

    return [
        {
            nombre: categoria.campoId,
            etiqueta: categoria.titulo,
            opciones: catalogo.map((item) => ({
                value: String(item[categoria.campoId]),
                label: etiquetaDe(item),
            })),
        },
    ];
};

const filaCompleta = (categoria, fila) => {
    if (categoria.key === 'transportes') {
        return Boolean(fila.matricula) && Boolean(fila.id_ruta);
    }
    const idValido = Boolean(fila[categoria.campoId]);
    if (!categoria.tieneCantidad) return idValido;
    return idValido && Number(fila.cantidad) >= 1;
};

const mapearFila = (categoria, fila) => {
    if (categoria.key === 'transportes') {
        return { matricula: fila.matricula, id_ruta: Number(fila.id_ruta) };
    }
    if (categoria.tieneCantidad) {
        return { [categoria.campoId]: Number(fila[categoria.campoId]), cantidad: Number(fila.cantidad) };
    }
    return { [categoria.campoId]: Number(fila[categoria.campoId]) };
};

const describirFila = (categoria, fila, catalogos, cantidadIntegrantes) => {
    if (categoria.key === 'transportes') {
        const ruta = (catalogos.ruta ?? []).find((r) => String(r.id_ruta) === String(fila.id_ruta));
        return `${fila.matricula} + ${ruta?.nombre_ruta ?? 'Ruta'}`;
    }
    const catalogo = catalogos[categoria.catalogoKey] ?? [];
    const item = catalogo.find((it) => String(it[categoria.campoId]) === String(fila[categoria.campoId]));
    const etiqueta = item ? ETIQUETA_POR_CATALOGO[categoria.catalogoKey](item) : '—';

    if (categoria.cantidadAutomatica) return `${etiqueta} x${cantidadIntegrantes ?? '—'}`;
    if (categoria.tieneCantidad) return `${etiqueta} x${fila.cantidad}`;
    return etiqueta;
};

export default function ModalAsignacionBeneficios({ open, solicitud, asignacion, loading, error, onClose, onSubmit }) {
    const [filas, setFilas] = useState(() => filasIniciales(asignacion));
    const [observaciones, setObservaciones] = useState(asignacion?.observaciones ?? '');
    const [catalogos, setCatalogos] = useState({});
    const [cargandoCatalogos, setCargandoCatalogos] = useState(true);
    const [errorCatalogos, setErrorCatalogos] = useState('');
    const [paso, setPaso] = useState('formulario');

    const cantidadIntegrantes = solicitud?.agrupacion?.cantidad_integrantes ?? null;

    useEffect(() => {
        if (!open) return undefined;
        let activo = true;

        Promise.all([
            obtenerBeneficios('mobiliario'),
            obtenerBeneficios('alimentacion'),
            obtenerBeneficios('aula'),
            obtenerBeneficios('transporte'),
            obtenerBeneficios('ruta'),
        ]).then(([mobiliario, alimentacion, aula, transporte, ruta]) => {
            if (!activo) return;

            const fallidos = [mobiliario, alimentacion, aula, transporte, ruta].filter((r) => !r.success);
            setErrorCatalogos(fallidos.length > 0 ? 'No se pudieron cargar algunos catálogos. Cierra e intenta de nuevo.' : '');

            setCatalogos({
                mobiliario: mobiliario.data ?? [],
                alimentacion: alimentacion.data ?? [],
                aula: aula.data ?? [],
                transporte: transporte.data ?? [],
                ruta: ruta.data ?? [],
            });
            setCargandoCatalogos(false);
        });

        return () => {
            activo = false;
        };
    }, [open]);

    useEffect(() => {
        if (!open) return undefined;
        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && !loading) onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [open, loading, onClose]);

    if (!open) return null;

    const editando = Boolean(asignacion);

    const agregarFila = (categoriaKey) => {
        setFilas((prev) => ({ ...prev, [categoriaKey]: [...prev[categoriaKey], FILA_VACIA[categoriaKey]] }));
    };

    const eliminarFila = (categoriaKey, indice) => {
        setFilas((prev) => ({ ...prev, [categoriaKey]: prev[categoriaKey].filter((_, i) => i !== indice) }));
    };

    const cambiarFila = (categoriaKey, indice, campo, valor) => {
        setFilas((prev) => ({
            ...prev,
            [categoriaKey]: prev[categoriaKey].map((fila, i) => (i === indice ? { ...fila, [campo]: valor } : fila)),
        }));
    };

    const hayFilasIncompletas = CATEGORIAS.some((categoria) =>
        filas[categoria.key].some((fila) => !filaCompleta(categoria, fila))
    );

    const construirPayload = () => {
        const payload = { observaciones: observaciones.trim() ? observaciones.trim() : null };

        CATEGORIAS.forEach((categoria) => {
            payload[categoria.key] = filas[categoria.key]
                .filter((fila) => filaCompleta(categoria, fila))
                .map((fila) => mapearFila(categoria, fila));
        });

        return payload;
    };

    const construirResumen = () => CATEGORIAS.map((categoria) => ({
        titulo: categoria.titulo,
        items: filas[categoria.key]
            .filter((fila) => filaCompleta(categoria, fila))
            .map((fila) => describirFila(categoria, fila, catalogos, cantidadIntegrantes)),
    }));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={loading ? undefined : onClose}>
            <div role="dialog" aria-modal="true" aria-labelledby="titulo-modal-asignacion" onClick={(event) => event.stopPropagation()} className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-surface rounded-2xl shadow-2xl p-6 sm:p-8 relative">
                <button type="button" onClick={onClose} disabled={loading} aria-label="Cerrar" className="absolute top-4 right-4 text-foreground-faint hover:text-foreground disabled:opacity-50 transition-colors cursor-pointer">
                    <X size={22} />
                </button>

                <h2 id="titulo-modal-asignacion" className="text-xl sm:text-2xl text-center font-bold text-primary mb-1">
                    {editando ? 'Editar asignación' : 'Crear asignación'}
                </h2>
                <p className="text-sm text-center text-foreground-soft mb-6">{solicitud?.agrupacion?.nombre}</p>

                {errorCatalogos && <div role="alert" className="mb-4 p-3 bg-danger-soft border border-danger/30 rounded-lg text-danger text-sm">{errorCatalogos}</div>}
                {error && <div role="alert" className="mb-4 p-3 bg-danger-soft border border-danger/30 rounded-lg text-danger text-sm">{error}</div>}

                {cargandoCatalogos ? (
                    <div className="flex items-center justify-center gap-2 py-16 text-foreground-soft">
                        <Loader2 className="animate-spin text-primary" size={26} />Cargando catálogos...
                    </div>
                ) : paso === 'formulario' ? (
                    <div className="space-y-5">
                        {CATEGORIAS.map((categoria) => (
                            <SeccionCategoriaAsignacion
                                key={categoria.key}
                                titulo={categoria.titulo}
                                nota={categoria.cantidadAutomatica ? `Se asignará x${cantidadIntegrantes ?? '—'} automáticamente (integrantes de la agrupación).` : undefined}
                                filas={filas[categoria.key]}
                                campos={construirCampos(categoria, catalogos)}
                                tieneCantidad={categoria.tieneCantidad}
                                disabled={loading}
                                onAgregar={() => agregarFila(categoria.key)}
                                onEliminar={(indice) => eliminarFila(categoria.key, indice)}
                                onCambiarFila={(indice, campo, valor) => cambiarFila(categoria.key, indice, campo, valor)}
                            />
                        ))}

                        <div className="space-y-1">
                            <label htmlFor="observaciones-asignacion" className="text-xs font-medium text-foreground-soft uppercase tracking-wider block">
                                Observaciones
                            </label>
                            <textarea
                                id="observaciones-asignacion"
                                value={observaciones}
                                onChange={(event) => setObservaciones(event.target.value)}
                                disabled={loading}
                                maxLength={1000}
                                rows={3}
                                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-surface-soft disabled:text-foreground-faint disabled:cursor-not-allowed"
                            />
                        </div>

                        {hayFilasIncompletas && (
                            <p className="text-xs text-warning">Completa o elimina las filas con campos vacíos antes de continuar.</p>
                        )}

                        <button
                            type="button"
                            onClick={() => setPaso('resumen')}
                            disabled={loading || hayFilasIncompletas}
                            className="w-full py-2.5 px-4 bg-primary hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors cursor-pointer"
                        >
                            Ver resumen
                        </button>
                    </div>
                ) : (
                    <div className="space-y-5">
                        <ResumenAsignacion solicitud={solicitud} observaciones={observaciones.trim()} secciones={construirResumen()} />

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setPaso('formulario')}
                                disabled={loading}
                                className="flex-1 py-2.5 px-4 border border-border rounded-lg font-semibold text-foreground-soft hover:bg-primary/5 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                Volver a editar
                            </button>
                            <button
                                type="button"
                                onClick={() => onSubmit(construirPayload())}
                                disabled={loading}
                                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-primary hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors cursor-pointer"
                            >
                                {loading && <Loader2 size={18} className="animate-spin" />}
                                {loading ? 'Guardando...' : 'Confirmar y guardar'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
