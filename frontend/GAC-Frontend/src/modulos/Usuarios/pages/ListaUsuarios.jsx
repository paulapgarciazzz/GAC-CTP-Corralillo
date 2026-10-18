import { useState } from 'react';
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2, UserPlus, Users } from 'lucide-react';
import Avatar from '../../../components/Avatar';
import Aviso from '../../../components/Aviso';
import BarraBusqueda from '../../../components/BarraBusqueda';
import ModalConfirmarEliminacion from '../../../components/ModalConfirmarEliminacion';
import { useConfirmarEliminacion } from '../../../hooks/useConfirmarEliminacion';
import { useAuth } from '../../../auth/hooks/useAuth';
import { usePermisosModulo } from '../../../auth/hooks/usePermisosModulo';
import { InsigniaEstado, InsigniaRol } from '../components/Insignias';
import ModalUsuario from '../components/ModalUsuario';
import { useListadoPaginado } from '../hooks/useListadoPaginado';
import { actualizarUsuario, crearUsuario, eliminarUsuario, obtenerUsuarios } from '../services/usuarioService';

const BOTON_ICONO = 'h-10 w-10 inline-flex items-center justify-center rounded-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary';

function AccionesUsuario({ usuario, puedeEditar, puedeEliminar, onEditar, onEliminar }) {
    return (
        <div className="flex items-center justify-end gap-1">
            {puedeEditar && (
                <button type="button" onClick={() => onEditar(usuario)} aria-label={`Editar a ${usuario.name}`} title="Editar"
                    className={`${BOTON_ICONO} text-foreground-soft hover:text-primary hover:bg-primary/10`}>
                    <Pencil size={18} />
                </button>
            )}
            {puedeEliminar && (
                <button type="button" onClick={() => onEliminar(usuario)} aria-label={`Eliminar a ${usuario.name}`} title="Eliminar"
                    className={`${BOTON_ICONO} text-foreground-soft hover:text-danger hover:bg-danger-soft`}>
                    <Trash2 size={18} />
                </button>
            )}
        </div>
    );
}

function FilasCargando() {
    return Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse motion-reduce:animate-none">
            <span className="h-10 w-10 rounded-full bg-border" />
            <div className="flex-1 space-y-2">
                <span className="block h-3 w-40 max-w-full rounded bg-border" />
                <span className="block h-3 w-56 max-w-full rounded bg-border/70" />
            </div>
        </div>
    ));
}

export default function ListaUsuarios() {
    const { user: usuarioActual, refrescarUsuario } = useAuth();
    const { puedeCrear, puedeEditar, puedeEliminar } = usePermisosModulo('usuarios');
    const listado = useListadoPaginado(obtenerUsuarios);
    const [modal, setModal] = useState({ abierto: false, usuario: null });
    const [mensajeExito, setMensajeExito] = useState('');

    const mostrarExito = (mensaje) => {
        setMensajeExito(mensaje);
        window.setTimeout(() => setMensajeExito(''), 3500);
    };

    const eliminacion = useConfirmarEliminacion(
        (usuario) => eliminarUsuario(usuario.id),
        () => {
            listado.recargar();
            mostrarExito('Usuario eliminado correctamente.');
        },
    );

    const cerrarModal = () => setModal({ abierto: false, usuario: null });

    const guardarUsuario = async (datos) => {
        const editando = modal.usuario;
        const resultado = editando ? await actualizarUsuario(editando.id, datos) : await crearUsuario(datos);

        if (resultado.success) {
            if (editando) listado.actualizarItem(resultado.data);
            else listado.recargar();
            if (resultado.data.id === usuarioActual?.id) refrescarUsuario();
            cerrarModal();
            mostrarExito(editando ? 'Usuario actualizado correctamente.' : 'Usuario creado correctamente.');
        }
        return resultado;
    };

    const { items: usuarios, meta, error, cargandoInicial, busquedaActiva } = listado;
    const sinResultados = !cargandoInicial && !error && usuarios.length === 0;
    const accionesProps = (usuario) => ({
        usuario,
        puedeEditar,
        puedeEliminar: puedeEliminar && usuario.id !== usuarioActual?.id,
        onEditar: (u) => setModal({ abierto: true, usuario: u }),
        onEliminar: eliminacion.abrir,
    });

    return (
        <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-primary">Lista de Usuarios</h1>
                    <p className="mt-1 text-sm text-foreground-soft">Crea, edita y elimina las cuentas que acceden al sistema.</p>
                </div>
                {puedeCrear && (
                    <button type="button" onClick={() => setModal({ abierto: true, usuario: null })}
                        className="inline-flex items-center justify-center gap-2 h-11 px-4 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold transition-colors cursor-pointer">
                        <Plus size={18} />Nuevo usuario
                    </button>
                )}
            </div>

            <BarraBusqueda valor={listado.textoBusqueda} onChange={listado.buscar} onLimpiar={listado.limpiarBusqueda} />

            <Aviso tipo="exito" mensaje={mensajeExito} />
            <Aviso mensaje={error} onReintentar={listado.recargar} />

            <section aria-label="Usuarios" aria-busy={cargandoInicial} className="bg-surface border border-border rounded-xl overflow-hidden">
                {cargandoInicial && usuarios.length === 0 ? (
                    <FilasCargando />
                ) : sinResultados ? (
                    <div className="flex flex-col items-center text-center gap-3 px-4 py-14">
                        <span className="h-12 w-12 inline-flex items-center justify-center rounded-full bg-primary/10 text-primary">
                            {busquedaActiva ? <Users size={22} /> : <UserPlus size={22} />}
                        </span>
                        {busquedaActiva ? (
                            <>
                                <p className="font-medium text-foreground">No se encontraron usuarios para “{busquedaActiva}”</p>
                                <p className="text-sm text-foreground-soft">Revisa la ortografía o busca por correo electrónico.</p>
                                <button type="button" onClick={listado.limpiarBusqueda} className="text-sm font-semibold text-primary hover:underline cursor-pointer">Limpiar búsqueda</button>
                            </>
                        ) : (
                            <>
                                <p className="font-medium text-foreground">Aún no hay usuarios registrados</p>
                                {puedeCrear && <button type="button" onClick={() => setModal({ abierto: true, usuario: null })} className="text-sm font-semibold text-primary hover:underline cursor-pointer">Crear el primer usuario</button>}
                            </>
                        )}
                    </div>
                ) : (
                    <div className={`transition-opacity duration-150 ${cargandoInicial ? 'opacity-60' : ''}`}>
                        {/* Escritorio: tabla */}
                        <table className="hidden md:table w-full text-sm">
                            <thead className="bg-background text-left text-xs uppercase tracking-wider text-foreground-soft">
                                <tr>
                                    <th scope="col" className="px-4 py-3 font-medium">Usuario</th>
                                    <th scope="col" className="px-4 py-3 font-medium">Rol</th>
                                    <th scope="col" className="px-4 py-3 font-medium">Estado</th>
                                    <th scope="col" className="px-4 py-3 font-medium text-right"><span className="sr-only">Acciones</span></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {usuarios.map((usuario) => (
                                    <tr key={usuario.id} className="hover:bg-background/60 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <Avatar nombre={usuario.name} foto={usuario.foto} />
                                                <div className="min-w-0">
                                                    <p className="font-medium text-foreground truncate">
                                                        {usuario.name}
                                                        {usuario.id === usuarioActual?.id && <span className="ml-2 text-xs font-normal text-foreground-faint">(tú)</span>}
                                                    </p>
                                                    <p className="text-foreground-soft truncate">{usuario.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3"><InsigniaRol esAdmin={usuario.es_admin} /></td>
                                        <td className="px-4 py-3"><InsigniaEstado activo={usuario.activo} /></td>
                                        <td className="px-4 py-2"><AccionesUsuario {...accionesProps(usuario)} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Móvil: lista de tarjetas */}
                        <ul className="md:hidden divide-y divide-border">
                            {usuarios.map((usuario) => (
                                <li key={usuario.id} className="flex items-start gap-3 p-4">
                                    <Avatar nombre={usuario.name} foto={usuario.foto} />
                                    <div className="min-w-0 flex-1 space-y-1.5">
                                        <p className="font-medium text-foreground truncate">{usuario.name}</p>
                                        <p className="text-sm text-foreground-soft truncate">{usuario.email}</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            <InsigniaRol esAdmin={usuario.es_admin} />
                                            <InsigniaEstado activo={usuario.activo} />
                                        </div>
                                    </div>
                                    <AccionesUsuario {...accionesProps(usuario)} />
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {meta && meta.last_page > 1 && (
                    <nav aria-label="Paginación" className="flex items-center justify-between gap-3 px-4 py-3 border-t border-border text-sm text-foreground-soft">
                        <span>{meta.from}–{meta.to} de {meta.total}</span>
                        <div className="flex items-center gap-1">
                            <button type="button" onClick={() => listado.irAPagina(meta.current_page - 1)} disabled={meta.current_page <= 1 || cargandoInicial}
                                aria-label="Página anterior" className={`${BOTON_ICONO} border border-border hover:bg-background disabled:opacity-40 disabled:cursor-not-allowed`}>
                                <ChevronLeft size={18} />
                            </button>
                            <span className="px-2">Página {meta.current_page} de {meta.last_page}</span>
                            <button type="button" onClick={() => listado.irAPagina(meta.current_page + 1)} disabled={meta.current_page >= meta.last_page || cargandoInicial}
                                aria-label="Página siguiente" className={`${BOTON_ICONO} border border-border hover:bg-background disabled:opacity-40 disabled:cursor-not-allowed`}>
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </nav>
                )}
            </section>

            {modal.abierto && (
                <ModalUsuario
                    usuario={modal.usuario}
                    esUsuarioActual={modal.usuario?.id === usuarioActual?.id}
                    onClose={cerrarModal}
                    onGuardar={guardarUsuario}
                />
            )}
            <ModalConfirmarEliminacion
                open={Boolean(eliminacion.elemento)}
                titulo="Eliminar usuario"
                nombre={eliminacion.elemento?.name}
                advertencia="El usuario perderá el acceso al sistema de inmediato."
                textoBoton="Eliminar usuario"
                loading={eliminacion.eliminando}
                error={eliminacion.error}
                onClose={eliminacion.cerrar}
                onConfirm={eliminacion.confirmar}
            />
        </div>
    );
}
