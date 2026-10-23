<?php

namespace App\Modules\Usuarios\Support;

/**
 * Fuente única de módulos y acciones para los permisos del sistema.
 * Agregar un módulo aquí y volver a ejecutar PermisosSeeder.
 */
final class Modulos
{
    public const ROL_ADMIN = 'admin';

    public const ACCIONES = ['ver', 'crear', 'editar', 'eliminar'];

    /** Acción base: tener cualquier acción de un módulo implica poder verlo. */
    public const ACCION_BASE = 'ver';

    /** Acciones que usa cada módulo; los de solo consulta tienen únicamente la acción base. */
    public const MODULOS = [
        'solicitudes' => self::ACCIONES,
        'beneficios' => self::ACCIONES,
        'calendario' => self::ACCIONES,
        'usuarios' => self::ACCIONES,
        'reportes' => [self::ACCION_BASE],
        'personalizacion' => self::ACCIONES,
        'conteo' => [self::ACCION_BASE],
    ];

    /**
     * Lista completa de permisos con formato "{modulo}.{accion}".
     *
     * @return array<int, string>
     */
    public static function permisos(): array
    {
        $permisos = [];

        foreach (self::MODULOS as $modulo => $acciones) {
            foreach ($acciones as $accion) {
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
