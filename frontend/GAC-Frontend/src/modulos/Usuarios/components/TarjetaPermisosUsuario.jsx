import { memo, useCallback, useMemo, useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import Avatar from '../../../components/Avatar';
import Switch from '../../../components/Switch';
import { ACCION_POR_DEFECTO, ACCIONES, MODULOS, permiso } from '../constants/modulos';
import { guardarPermisosUsuario } from '../services/usuarioService';

const mismosPermisos = (a, b) => a.size === b.size && [...a].every((p) => b.has(p));

/**
 * Fila de un módulo: el módulo funciona como encabezado (switch de acceso) y,
 * si está encendido, sus permisos aparecen en un panel interno aparte.
 * "Ver" es la acción base: queda fija mientras el módulo esté encendido.
 * `activas` es un string ("crear,ver") para que memo compare por valor.
 */
const FilaModulo = memo(function FilaModulo({ modulo, activas, editable, onToggleModulo, onToggleAccion }) {
    const acciones = activas ? activas.split(',') : [];
    const encendido = acciones.length > 0;
    const Icono = modulo.icono;

    return (
        <li className="py-2">
            <div className={`flex items-center gap-3 rounded-lg px-2 py-2 transition-colors duration-200 ${encendido ? 'bg-primary/5' : ''}`}>
                <span aria-hidden="true" className={`h-10 w-10 shrink-0 inline-flex items-center justify-center rounded-lg transition-colors duration-200 ${encendido ? 'bg-primary/15 text-primary' : 'bg-background text-foreground-faint'}`}>
                    <Icono size={20} />
                </span>
                <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-semibold text-foreground truncate">{modulo.nombre}</p>
                    <p className="text-xs text-foreground-faint">
                        {encendido ? `${acciones.length} de ${ACCIONES.length} permisos` : 'Sin acceso'}
                    </p>
                </div>
                <Switch
                    checked={encendido}
                    onChange={(valor) => onToggleModulo(modulo.slug, valor)}
                    label={`Acceso al módulo ${modulo.nombre}`}
                    disabled={!editable}
                />
            </div>

            {encendido && (
                <div className="mt-2 mx-2 p-3 rounded-lg bg-background border border-border
                    transition-[opacity,translate] duration-200 starting:opacity-0 starting:-translate-y-1 motion-reduce:transition-none">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-foreground-faint">Permisos</p>
                    <ul aria-label={`Permisos en ${modulo.nombre}`} className="grid grid-cols-2 gap-x-4 gap-y-3">
                        {ACCIONES.map((accion) => {
                            const esBase = accion.clave === ACCION_POR_DEFECTO;
                            return (
                                <li key={accion.clave} className="flex items-center justify-between gap-2" title={esBase ? 'Se quita apagando el módulo' : undefined}>
                                    <span className="text-sm text-foreground-soft">
                                        {accion.nombre}
                                        {esBase && <span className="text-foreground-faint"> · incluido</span>}
                                    </span>
                                    <Switch
                                        tamano="sm"
                                        checked={esBase || acciones.includes(accion.clave)}
                                        onChange={(valor) => onToggleAccion(modulo.slug, accion.clave, valor)}
                                        label={esBase ? `${accion.nombre} en ${modulo.nombre} (incluido mientras el módulo esté activo)` : `${accion.nombre} en ${modulo.nombre}`}
                                        disabled={!editable || esBase}
                                    />
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </li>
    );
});

/**
 * Tarjeta de un usuario con sus módulos y permisos. Guarda su propio borrador,
 * así un cambio de switch solo vuelve a renderizar esta tarjeta.
 */
function TarjetaPermisosUsuario({ usuario, editable, onGuardado }) {
    const original = useMemo(() => new Set(usuario.permissions), [usuario.permissions]);
    const [seleccion, setSeleccion] = useState(original);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');
    const [guardadoOk, setGuardadoOk] = useState(false);

    const sucio = !mismosPermisos(seleccion, original);
    const modulosActivos = MODULOS.filter((m) => [...seleccion].some((p) => p.startsWith(`${m.slug}.`))).length;

    const modificar = useCallback((cambio) => {
        setGuardadoOk(false);
        setSeleccion((prev) => {
            const siguiente = new Set(prev);
            cambio(siguiente);
            return siguiente;
        });
    }, []);

    const onToggleModulo = useCallback((slug, encender) => modificar((set) => {
        if (encender) set.add(permiso(slug, ACCION_POR_DEFECTO));
        else ACCIONES.forEach((a) => set.delete(permiso(slug, a.clave)));
    }), [modificar]);

    const onToggleAccion = useCallback((slug, accion, encender) => modificar((set) => {
        if (encender) set.add(permiso(slug, accion));
        else set.delete(permiso(slug, accion));
        set.add(permiso(slug, ACCION_POR_DEFECTO)); // "ver" nunca se pierde mientras el módulo esté activo
    }), [modificar]);

    const descartar = () => {
        setSeleccion(original);
        setError('');
    };

    const guardar = async () => {
        setGuardando(true);
        setError('');
        const resultado = await guardarPermisosUsuario(usuario.id, [...seleccion]);
        setGuardando(false);

        if (!resultado.success) {
            setError(resultado.error);
            return;
        }
        setSeleccion(new Set(resultado.data.permissions));
        setGuardadoOk(true);
        onGuardado(resultado.data);
    };

    return (
        <article className="bg-surface border border-border rounded-xl shadow-sm flex flex-col">
            <header className="flex items-center gap-3 p-4 border-b border-border">
                <Avatar nombre={usuario.name} foto={usuario.foto} tamano="lg" />
                <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-foreground truncate">{usuario.name}</h3>
                    <p className="text-sm text-foreground-soft truncate">{usuario.email}</p>
                </div>
                <span className="shrink-0 text-xs font-medium text-foreground-soft bg-background border border-border rounded-full px-2.5 py-1">
                    {modulosActivos}/{MODULOS.length} módulos
                </span>
            </header>

            <ul className="px-4 divide-y divide-border flex-1">
                {MODULOS.map((modulo) => (
                    <FilaModulo
                        key={modulo.slug}
                        modulo={modulo}
                        activas={ACCIONES.filter((a) => seleccion.has(permiso(modulo.slug, a.clave))).map((a) => a.clave).join(',')}
                        editable={editable && !guardando}
                        onToggleModulo={onToggleModulo}
                        onToggleAccion={onToggleAccion}
                    />
                ))}
            </ul>

            {editable && (
                <footer className="p-4 border-t border-border space-y-3">
                    {error && <p role="alert" className="text-sm text-danger">{error}</p>}
                    <div className="flex items-center justify-end gap-2">
                        <span role="status" className="mr-auto text-sm">
                            {guardadoOk && !sucio && <span className="inline-flex items-center gap-1 text-success"><Check size={16} />Guardado</span>}
                            {sucio && <span className="text-warning">Cambios sin guardar</span>}
                        </span>
                        {sucio && (
                            <button type="button" onClick={descartar} disabled={guardando}
                                className="h-10 px-3 text-sm rounded-lg font-medium border border-border text-foreground-soft hover:bg-background disabled:opacity-50 transition-colors cursor-pointer">
                                Descartar
                            </button>
                        )}
                        <button type="button" onClick={guardar} disabled={!sucio || guardando}
                            className="h-10 px-4 text-sm rounded-lg font-semibold bg-primary hover:bg-primary-hover text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer inline-flex items-center gap-2">
                            {guardando && <Loader2 size={16} className="animate-spin" />}
                            {guardando ? 'Guardando...' : 'Guardar cambios'}
                        </button>
                    </div>
                </footer>
            )}
        </article>
    );
}

export default memo(TarjetaPermisosUsuario);
