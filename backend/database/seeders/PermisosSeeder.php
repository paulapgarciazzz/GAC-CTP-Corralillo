<?php

namespace Database\Seeders;

use App\Models\User;
use App\Modules\Usuarios\Support\Modulos;
use Illuminate\Database\Seeder;
use RuntimeException;
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
        $email = config('admin.email');
        $password = config('admin.password');

        if (blank($email) || blank($password)) {
            throw new RuntimeException('Defina ADMIN_EMAIL y ADMIN_PASSWORD en backend/.env antes de ejecutar PermisosSeeder.');
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        foreach (Modulos::permisos() as $permiso) {
            Permission::findOrCreate($permiso, 'web');
        }

        $rolAdmin = Role::findOrCreate(Modulos::ROL_ADMIN, 'web');

        $admin = User::firstOrCreate(
            ['email' => $email],
            [
                'name' => config('admin.name'),
                'password' => $password,
                'activo' => true,
            ]
        );

        $admin->assignRole($rolAdmin);

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
