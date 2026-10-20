import { useAuth } from './useAuth';

/**
 * Acciones permitidas al usuario en un módulo, p. ej. usePermisosModulo('beneficios').
 * Patrón de uso: la página pasa el handler solo si hay permiso
 * (`onEditar={puedeEditar ? abrirEditar : undefined}`) y el componente
 * muestra el botón solo si lo recibió.
 */
export function usePermisosModulo(modulo) {
    const { can } = useAuth();

    return {
        puedeCrear: can(`${modulo}.crear`),
        puedeEditar: can(`${modulo}.editar`),
        puedeEliminar: can(`${modulo}.eliminar`),
    };
}
