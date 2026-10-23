import { Activity, CalendarDays, ClipboardMinus, FileUser, Paintbrush, ShelvingUnit, UserCog } from 'lucide-react';

/**
 * Fuente única de módulos y acciones del sistema de permisos.
 * Debe coincidir con backend/app/Modules/Usuarios/Support/Modulos.php.
 * Un permiso tiene el formato "{modulo}.{accion}", p. ej. "calendario.ver".
 */
export const ACCIONES = [
    { clave: 'crear', nombre: 'Crear' },
    { clave: 'ver', nombre: 'Ver' },
    { clave: 'editar', nombre: 'Editar' },
    { clave: 'eliminar', nombre: 'Eliminar' },
];

// Acción que se activa por defecto al encender un módulo.
export const ACCION_POR_DEFECTO = 'ver';

// Módulos de solo consulta: no tienen crear/editar/eliminar.
const SOLO_VER = ACCIONES.filter((a) => a.clave === ACCION_POR_DEFECTO);

export const MODULOS = [
    { slug: 'solicitudes', nombre: 'Solicitudes', icono: FileUser, acciones: ACCIONES },
    { slug: 'beneficios', nombre: 'Beneficios', icono: ShelvingUnit, acciones: ACCIONES },
    { slug: 'calendario', nombre: 'Calendario', icono: CalendarDays, acciones: ACCIONES },
    { slug: 'usuarios', nombre: 'Gestión de Usuarios', icono: UserCog, acciones: ACCIONES },
    { slug: 'reportes', nombre: 'Reportes', icono: ClipboardMinus, acciones: SOLO_VER },
    { slug: 'personalizacion', nombre: 'Personalización', icono: Paintbrush, acciones: ACCIONES },
    { slug: 'conteo', nombre: 'Conteo de personas', icono: Activity, acciones: SOLO_VER },
];

export const permiso = (modulo, accion) => `${modulo}.${accion}`;
