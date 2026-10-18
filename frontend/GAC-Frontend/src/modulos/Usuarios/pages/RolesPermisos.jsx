import { useEffect, useRef } from 'react';
import { Info, Loader2, ShieldCheck, Users } from 'lucide-react';
import { useAuth } from '../../../auth/hooks/useAuth';
import Aviso from '../../../components/Aviso';
import BarraBusqueda from '../../../components/BarraBusqueda';
import TarjetaPermisosUsuario from '../components/TarjetaPermisosUsuario';
import { useListadoPaginado } from '../hooks/useListadoPaginado';
import { obtenerUsuariosConPermisos } from '../services/usuarioService';

function TarjetaCargando() {
    return (
        <div className="bg-surface border border-border rounded-xl p-4 space-y-4 animate-pulse motion-reduce:animate-none">
            <div className="flex items-center gap-3">
                <span className="h-12 w-12 rounded-full bg-border" />
                <div className="flex-1 space-y-2">
                    <span className="block h-3 w-32 rounded bg-border" />
                    <span className="block h-3 w-44 rounded bg-border/70" />
                </div>
            </div>
            {Array.from({ length: 5 }, (_, i) => <span key={i} className="block h-9 rounded-lg bg-border/60" />)}
        </div>
    );
}

/**
 * Muestra más tarjetas automáticamente al acercarse al final de la lista.
 * El botón queda como alternativa accesible por teclado.
 */
function CargarMas({ visible, cargando, onCargar }) {
    const ref = useRef(null);

    useEffect(() => {
        const nodo = ref.current;
        if (!visible || cargando || !nodo) return undefined;
        const observer = new IntersectionObserver(([entrada]) => entrada.isIntersecting && onCargar(), { rootMargin: '200px' });
        observer.observe(nodo);
        return () => observer.disconnect();
    }, [visible, cargando, onCargar]);

    if (!visible) return null;

    return (
        <div ref={ref} className="flex justify-center pt-2">
            <button type="button" onClick={onCargar} disabled={cargando}
                className="inline-flex items-center gap-2 h-11 px-4 border border-border rounded-lg text-sm font-medium text-foreground-soft hover:bg-surface disabled:opacity-60 transition-colors cursor-pointer">
                {cargando && <Loader2 size={16} className="animate-spin" />}
                {cargando ? 'Cargando...' : 'Cargar más usuarios'}
            </button>
        </div>
    );
}

export default function RolesPermisos() {
    const { can } = useAuth();
    const listado = useListadoPaginado(obtenerUsuariosConPermisos, { acumular: true });
    const { items: usuarios, error, cargandoInicial, cargandoMas, hayMas, busquedaActiva } = listado;
    const editable = can('usuarios.editar');

    return (
        <div className="space-y-5">
            <div>
                <h1 className="text-2xl font-bold text-primary">Roles y Permisos</h1>
                <p className="mt-1 text-sm text-foreground-soft">Define a qué módulos accede cada usuario y qué puede hacer en cada uno.</p>
            </div>

            <div className="flex items-start gap-3 p-3 bg-info-soft border border-info/30 rounded-lg text-sm text-info">
                <Info size={18} className="shrink-0 mt-0.5" aria-hidden="true" />
                <p>Los administradores tienen acceso total y se gestionan en <strong>Lista de Usuarios</strong>, por eso no aparecen aquí.</p>
            </div>

            <BarraBusqueda valor={listado.textoBusqueda} onChange={listado.buscar} onLimpiar={listado.limpiarBusqueda} />

            <Aviso mensaje={error} onReintentar={listado.recargar} />

            {cargandoInicial ? (
                <div aria-busy="true" className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
                    {Array.from({ length: 3 }, (_, i) => <TarjetaCargando key={i} />)}
                </div>
            ) : !error && usuarios.length === 0 ? (
                <div className="flex flex-col items-center text-center gap-3 px-4 py-14 bg-surface border border-border rounded-xl">
                    <span className="h-12 w-12 inline-flex items-center justify-center rounded-full bg-primary/10 text-primary">
                        {busquedaActiva ? <Users size={22} /> : <ShieldCheck size={22} />}
                    </span>
                    {busquedaActiva ? (
                        <>
                            <p className="font-medium text-foreground">No se encontraron usuarios para “{busquedaActiva}”</p>
                            <button type="button" onClick={listado.limpiarBusqueda} className="text-sm font-semibold text-primary hover:underline cursor-pointer">Limpiar búsqueda</button>
                        </>
                    ) : (
                        <>
                            <p className="font-medium text-foreground">No hay usuarios a los que asignar permisos</p>
                            <p className="text-sm text-foreground-soft">Crea un usuario no administrador en Lista de Usuarios.</p>
                        </>
                    )}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4 items-start">
                        {usuarios.map((usuario) => (
                            <TarjetaPermisosUsuario key={usuario.id} usuario={usuario} editable={editable} onGuardado={listado.actualizarItem} />
                        ))}
                    </div>
                    <CargarMas visible={hayMas} cargando={cargandoMas} onCargar={listado.cargarMas} />
                </>
            )}
        </div>
    );
}
