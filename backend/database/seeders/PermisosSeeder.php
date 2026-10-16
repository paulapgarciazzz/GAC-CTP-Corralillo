<?php

namespace Database\Seeders;

use App\Models\User;
use App\Modules\Usuarios\Support\Modulos;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class PermisosSeeder extends Seeder
{
    /**
     * Crea los permisos por módulo, el rol administrador y el usuario administrador inicial.
     */
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        foreach (Modulos::permisos() as $permiso) {
            Permission::findOrCreate($permiso, 'web');
        }

        $rolAdmin = Role::findOrCreate(Modulos::ROL_ADMIN, 'web');

        $admin = User::firstOrCreate(
            ['email' => env('ADMIN_EMAIL', 'admin@ctp.local')],
            [
                'name' => env('ADMIN_NAME', 'Administrador'),
                'password' => env('ADMIN_PASSWORD', 'cambiar123'),
                'activo' => true,
            ]
        );

        $admin->assignRole($rolAdmin);

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
