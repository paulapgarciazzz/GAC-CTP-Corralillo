<?php

namespace Tests\Concerns;

use App\Models\User;
use App\Modules\Usuarios\Support\Modulos;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

/**
 * Autentica un administrador para probar rutas protegidas con auth:sanctum.
 * Las rutas públicas de la landing deben probarse sin llamarlo.
 */
trait ActuaComoAdmin
{
    protected function actuarComoAdmin(): User
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $admin = User::create([
            'name' => 'Admin de prueba',
            'email' => 'admin-pruebas@ejemplo.com',
            'password' => 'secreto123',
            'activo' => true,
        ]);
        $admin->assignRole(Role::findOrCreate(Modulos::ROL_ADMIN, 'web'));
        Sanctum::actingAs($admin);

        return $admin;
    }
}
