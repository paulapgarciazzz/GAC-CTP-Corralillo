<?php

use App\Modules\Usuarios\Support\Modulos;
use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

/**
 * Elimina los permisos que ya no existen en Modulos (p. ej. reportes.crear,
 * conteo.editar): esos módulos son de solo consulta. Al borrar el permiso,
 * Spatie también lo quita de los usuarios y roles que lo tenían.
 */
return new class extends Migration
{
    public function up(): void
    {
        Permission::where('guard_name', 'web')
            ->whereNotIn('name', Modulos::permisos())
            ->get()
            ->each->delete();

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function down(): void
    {
        // Los permisos eliminados no se usaban en ninguna ruta; no se restauran.
    }
};
