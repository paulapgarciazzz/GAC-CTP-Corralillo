<?php

namespace App\Modules\Usuarios\Support;

/**
 * Fuente única de módulos y acciones para los permisos del sistema.
 * Agregar un módulo aquí y volver a ejecutar PermisosSeeder.
 */
final class Modulos
{
    public const ROL_ADMIN = 'admin';

    public const MODULOS = [
        'solicitudes',
        'beneficios',
        'calendario',
        'usuarios',
        'reportes',
        'personalizacion',
        'conteo',
    ];

    public const ACCIONES = ['ver', 'crear', 'editar', 'eliminar'];

    /** Acción base: tener cualquier acción de un módulo implica poder verlo. */
    public const ACCION_BASE = 'ver';

    /**
     * Lista completa de permisos con formato "{modulo}.{accion}".
     *
     * @return array<int, string>
     */
    public static function permisos(): array
    {
        $permisos = [];

        foreach (self::MODULOS as $modulo) {
            foreach (self::ACCIONES as $accion) {
                $permisos[] = "{$modulo}.{$accion}";
            }
        }

        return $permisos;
    }

    /**
     * Agrega "{modulo}.ver" a cada módulo que tenga alguna acción.
     *
     * @param  array<int, string>  $permisos
     * @return array<int, string>
     */
    public static function conAccionBase(array $permisos): array
    {
        foreach ($permisos as $permiso) {
            $modulo = strstr($permiso, '.', true);
            $permisos[] = "{$modulo}." . self::ACCION_BASE;
        }

        return array_values(array_unique($permisos));
    }
}
