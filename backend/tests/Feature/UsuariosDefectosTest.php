<?php

namespace Tests\Feature;

use App\Models\User;
use App\Modules\Usuarios\Support\Modulos;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

/**
 * Regresión de DEF-USR-001 a DEF-USR-004 (registro de defectos de QA).
 * La variante concurrente de DEF-USR-003 (CP-USR-069) se verifica manualmente.
 */
class UsuariosDefectosTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        foreach (Modulos::permisos() as $permiso) {
            Permission::findOrCreate($permiso, 'web');
        }
        Role::findOrCreate(Modulos::ROL_ADMIN, 'web');
    }

    private function crearUsuario(string $email, bool $admin = false, array $permisos = [], bool $activo = true): User
    {
        $usuario = User::create([
            'name' => $email,
            'email' => $email,
            'password' => 'Prueba123!',
            'activo' => $activo,
        ]);

        if ($admin) {
            $usuario->assignRole(Modulos::ROL_ADMIN);
        }
        $usuario->givePermissionTo($permisos);

        return $usuario;
    }

    // DEF-USR-001

    public function test_un_no_admin_con_editar_no_puede_darse_el_rol_de_administrador(): void
    {
        $editor = $this->crearUsuario('ueditar@qa.test', permisos: ['usuarios.ver', 'usuarios.editar']);
        Sanctum::actingAs($editor);

        $this->patchJson("/api/usuarios/{$editor->id}", ['es_admin' => true])
            ->assertStatus(422)
            ->assertJsonValidationErrors('es_admin');

        $this->assertFalse($editor->fresh()->hasRole(Modulos::ROL_ADMIN));
    }

    public function test_un_no_admin_con_crear_no_puede_crear_un_administrador(): void
    {
        Sanctum::actingAs($this->crearUsuario('ucrear@qa.test', permisos: ['usuarios.ver', 'usuarios.crear']));

        $this->postJson('/api/usuarios', [
            'name' => 'Nuevo admin',
            'email' => 'nuevoadmin@qa.test',
            'password' => 'Clave1234',
            'es_admin' => true,
        ])->assertStatus(422)->assertJsonValidationErrors('es_admin');

        $this->assertDatabaseMissing('users', ['email' => 'nuevoadmin@qa.test']);
    }

    public function test_un_no_admin_con_crear_puede_crear_usuarios_normales(): void
    {
        Sanctum::actingAs($this->crearUsuario('ucrear@qa.test', permisos: ['usuarios.ver', 'usuarios.crear']));

        $this->postJson('/api/usuarios', [
            'name' => 'Ana Pérez',
            'email' => 'ana@qa.test',
            'password' => 'Clave1234',
            'es_admin' => false,
        ])->assertCreated()->assertJsonPath('data.es_admin', false);
    }

    public function test_un_no_admin_no_puede_modificar_ni_eliminar_a_un_administrador(): void
    {
        $admin = $this->crearUsuario('admin1@qa.test', admin: true);
        Sanctum::actingAs($this->crearUsuario('uedit@qa.test', permisos: ['usuarios.ver', 'usuarios.editar', 'usuarios.eliminar']));

        $this->patchJson("/api/usuarios/{$admin->id}", ['password' => 'Tomada123'])
            ->assertStatus(422)
            ->assertJsonValidationErrors('usuario');
        $this->deleteJson("/api/usuarios/{$admin->id}")
            ->assertStatus(422)
            ->assertJsonValidationErrors('usuario');

        $this->assertTrue(Hash::check('Prueba123!', $admin->fresh()->password));
    }

    public function test_un_no_admin_con_editar_sigue_gestionando_usuarios_normales(): void
    {
        $objetivo = $this->crearUsuario('objetivo@qa.test', permisos: ['calendario.ver']);
        Sanctum::actingAs($this->crearUsuario('ueditar@qa.test', permisos: ['usuarios.ver', 'usuarios.editar']));

        $this->patchJson("/api/usuarios/{$objetivo->id}", ['name' => 'Objetivo Editado', 'es_admin' => false])
            ->assertOk()
            ->assertJsonPath('data.name', 'Objetivo Editado');
        $this->putJson("/api/usuarios/{$objetivo->id}/permisos", ['permisos' => ['beneficios.crear']])
            ->assertOk();

        $this->assertTrue($objetivo->fresh()->hasPermissionTo('beneficios.ver'));
    }

    public function test_nadie_puede_modificar_sus_propios_permisos(): void
    {
        $editor = $this->crearUsuario('ueditar@qa.test', permisos: ['usuarios.ver', 'usuarios.editar']);
        Sanctum::actingAs($editor);

        $this->putJson("/api/usuarios/{$editor->id}/permisos", ['permisos' => Modulos::permisos()])
            ->assertStatus(422)
            ->assertJsonValidationErrors('permisos');

        $this->assertFalse($editor->fresh()->hasPermissionTo('usuarios.eliminar'));
    }

    public function test_un_administrador_puede_otorgar_el_rol_de_administrador(): void
    {
        $objetivo = $this->crearUsuario('objetivo@qa.test');
        Sanctum::actingAs($this->crearUsuario('admin1@qa.test', admin: true));

        $this->patchJson("/api/usuarios/{$objetivo->id}", ['es_admin' => true])
            ->assertOk()
            ->assertJsonPath('data.es_admin', true);
    }

    // DEF-USR-002

    public function test_cambiar_la_contrasena_desde_lista_de_usuarios_cierra_sus_sesiones(): void
    {
        $objetivo = $this->crearUsuario('objetivo@qa.test');
        $objetivo->createToken('spa');
        $objetivo->createToken('spa');
        Sanctum::actingAs($this->crearUsuario('admin1@qa.test', admin: true));

        $this->patchJson("/api/usuarios/{$objetivo->id}", ['password' => 'OtraClave9'])->assertOk();

        $this->assertSame(0, $objetivo->tokens()->count());
    }

    public function test_editar_sin_cambiar_la_contrasena_conserva_sus_sesiones(): void
    {
        $objetivo = $this->crearUsuario('objetivo@qa.test');
        $objetivo->createToken('spa');
        Sanctum::actingAs($this->crearUsuario('admin1@qa.test', admin: true));

        $this->patchJson("/api/usuarios/{$objetivo->id}", ['name' => 'Otro nombre', 'password' => ''])->assertOk();

        $this->assertSame(1, $objetivo->tokens()->count());
    }

    public function test_cambiar_la_contrasena_desde_el_perfil_conserva_solo_la_sesion_actual(): void
    {
        $usuario = $this->crearUsuario('usin@qa.test');
        $actual = $usuario->createToken('spa');
        $usuario->createToken('spa');

        $this->withToken($actual->plainTextToken)
            ->patchJson('/api/perfil', [
                'password_actual' => 'Prueba123!',
                'password' => 'NuevaClave9',
                'password_confirmation' => 'NuevaClave9',
            ])->assertOk();

        $this->assertSame([$actual->accessToken->id], $usuario->tokens()->pluck('id')->all());
    }

    // DEF-USR-003

    public function test_no_se_puede_dejar_el_sistema_sin_administradores_activos(): void
    {
        $activo = $this->crearUsuario('admin1@qa.test', admin: true);
        // Admin desactivado con una sesión residual: antes contaba como "otro admin".
        Sanctum::actingAs($this->crearUsuario('admin2@qa.test', admin: true, activo: false));

        $this->deleteJson("/api/usuarios/{$activo->id}")
            ->assertStatus(422)
            ->assertJsonValidationErrors(['usuario' => 'Debe existir al menos un administrador activo.']);
        $this->patchJson("/api/usuarios/{$activo->id}", ['activo' => false])
            ->assertStatus(422)
            ->assertJsonValidationErrors('activo');
        $this->patchJson("/api/usuarios/{$activo->id}", ['es_admin' => false])
            ->assertStatus(422)
            ->assertJsonValidationErrors('es_admin');

        $activo->refresh();
        $this->assertTrue($activo->activo);
        $this->assertTrue($activo->hasRole(Modulos::ROL_ADMIN));
    }

    public function test_se_puede_desactivar_a_un_administrador_si_queda_otro_activo(): void
    {
        $otro = $this->crearUsuario('admin2@qa.test', admin: true);
        Sanctum::actingAs($this->crearUsuario('admin1@qa.test', admin: true));

        $this->patchJson("/api/usuarios/{$otro->id}", ['activo' => false])->assertOk();
        $this->deleteJson("/api/usuarios/{$otro->id}")->assertOk();
    }

    // DEF-USR-004

    public function test_los_errores_de_validacion_se_muestran_en_espanol(): void
    {
        $this->crearUsuario('objetivo@qa.test');
        Sanctum::actingAs($this->crearUsuario('admin1@qa.test', admin: true));

        $this->postJson('/api/usuarios', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['name' => 'El campo nombre completo es obligatorio.']);

        $this->postJson('/api/usuarios', ['name' => 'Ana', 'email' => 'objetivo@qa.test', 'password' => '1234567'])
            ->assertStatus(422)
            ->assertJsonValidationErrors([
                'email' => 'Este correo electrónico ya está registrado.',
                'password' => 'El campo contraseña debe tener al menos 8 caracteres.',
            ]);
    }

    public function test_el_limite_de_intentos_responde_en_espanol(): void
    {
        $credenciales = ['email' => 'nadie@qa.test', 'password' => 'Incorrecta1'];

        for ($i = 0; $i < 10; $i++) {
            $this->postJson('/api/login', $credenciales)->assertStatus(422);
        }

        $this->postJson('/api/login', $credenciales)
            ->assertStatus(429)
            ->assertHeader('Retry-After')
            ->assertJsonPath('message', 'Demasiados intentos. Intenta de nuevo en 1 minuto.');
    }
}
