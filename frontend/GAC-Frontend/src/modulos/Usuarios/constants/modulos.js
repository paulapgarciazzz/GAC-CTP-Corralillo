import { CalendarDays, ClipboardMinus, FileUser, Paintbrush, ShelvingUnit, UserCog } from 'lucide-react';

/**
 * Fuente única de módulos y acciones del sistema de permisos.
 * Debe coincidir con backend/app/Modules/Usuarios/Support/Modulos.php.
 * Un permiso tiene el formato "{modulo}.{accion}", p. ej. "calendario.ver".
 */
export const MODULOS = [
    { slug: 'solicitudes', nombre: 'Solicitudes', icono: FileUser },
    { slug: 'beneficios', nombre: 'Beneficios', icono: ShelvingUnit },
    { slug: 'calendario', nombre: 'Calendario', icono: CalendarDays },
    { slug: 'usuarios', nombre: 'Gestión de Usuarios', icono: UserCog },
    { slug: 'reportes', nombre: 'Reportes', icono: ClipboardMinus },
    { slug: 'personalizacion', nombre: 'Personalización', icono: Paintbrush },
];

export const ACCIONES = [
    { clave: 'crear', nombre: 'Crear' },
    { clave: 'ver', nombre: 'Ver' },
    { clave: 'editar', nombre: 'Editar' },
    { clave: 'eliminar', nombre: 'Eliminar' },
];

// Acción que se activa por defecto al encender un módulo.
export const ACCION_POR_DEFECTO = 'ver';

export const permiso = (modulo, accion) => `${modulo}.${accion}`;
