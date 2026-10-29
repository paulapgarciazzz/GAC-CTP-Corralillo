<?php

namespace Tests\Feature;

use App\Models\User;
use App\Modules\Calendario\Models\Actividad;
use App\Modules\Calendario\Models\EstadoActividad;
use App\Modules\Calendario\Models\Evento;
use App\Modules\Calendario\Models\Ubicacion;
use App\Modules\Usuarios\Support\Modulos;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

/**
 * Regresión de DEF-CAL-001, DEF-CAL-002 y DEF-CAL-004 (registro de defectos de QA).
 * DEF-CAL-003 (concurrencia) se verifica manualmente con peticiones en paralelo.
 */
class CalendarioDefectosTest extends TestCase
{
    use RefreshDatabase;

    private const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

    protected function setUp(): void
    {
        parent::setUp();

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $admin = User::create([
            'name' => 'Admin de prueba',
            'email' => 'admin-calendario@ejemplo.com',
            'password' => 'secreto123',
            'activo' => true,
        ]);
        $admin->assignRole(Role::findOrCreate(Modulos::ROL_ADMIN, 'web'));
        Sanctum::actingAs($admin);

        Carbon::setTestNow('2026-10-01 08:00:00');
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();

        parent::tearDown();
    }

    private function crearEvento(array $cambios = []): Evento
    {
        return Evento::create(array_merge([
            'nombre' => 'Festival',
            'fecha_inicio' => '2026-12-04',
            'fecha_fin' => '2026-12-06',
            'hora_inicio' => '08:00',
            'hora_fin' => '18:00',
            'todo_el_dia' => false,
        ], $cambios));
    }

    private function crearActividad(Evento $evento, string $fecha, string $inicio, string $fin): Actividad
    {
        return Actividad::create([
            'titulo' => 'Apertura',
            'fecha' => $fecha,
            'hora_inicio' => $inicio,
            'hora_finalizacion' => $fin,
            'id_evento' => $evento->id_evento,
            'id_estado_actividad' => EstadoActividad::query()
                ->where('nombre', EstadoActividad::PROXIMAMENTE)
                ->value('id_estado_actividad'),
        ]);
    }

    // DEF-CAL-001

    public function test_patch_parcial_de_hora_valida_contra_la_hora_guardada(): void
    {
        $evento = $this->crearEvento([
            'fecha_inicio' => '2026-12-10',
            'fecha_fin' => '2026-12-10',
            'hora_inicio' => '10:00',
            'hora_fin' => '12:00',
        ]);

        $this->patchJson("/api/eventos/{$evento->id_evento}", ['hora_fin' => '09:00'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['hora_fin']);

        $this->patchJson("/api/eventos/{$evento->id_evento}", ['hora_inicio' => '15:00'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['hora_fin']);

        $this->assertSame('12:00', substr($evento->refresh()->hora_fin, 0, 5));
    }

    public function test_patch_parcial_de_fecha_valida_contra_la_fecha_guardada(): void
    {
        $evento = $this->crearEvento();

        $this->patchJson("/api/eventos/{$evento->id_evento}", ['fecha_fin' => '2026-12-01'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['fecha_fin']);
    }

    public function test_patch_parcial_valido_se_guarda(): void
    {
        $evento = $this->crearEvento();

        $this->patchJson("/api/eventos/{$evento->id_evento}", ['nombre' => 'Feria gastronómica'])
            ->assertOk()
            ->assertJsonPath('data.nombre', 'Feria gastronómica');

        $this->patchJson("/api/eventos/{$evento->id_evento}", ['hora_fin' => '20:00'])
            ->assertOk();
    }

    // DEF-CAL-002

    public function test_no_permite_acortar_fechas_dejando_actividades_fuera(): void
    {
        $evento = $this->crearEvento();
        $this->crearActividad($evento, '2026-12-05', '10:00', '11:00');
        $this->crearActividad($evento, '2026-12-06', '16:00', '17:00');

        $this->patchJson("/api/eventos/{$evento->id_evento}", ['fecha_fin' => '2026-12-04'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['fecha_fin'])
            ->assertJsonPath('errors.fecha_fin.0', 'Hay 2 actividades fuera del nuevo rango de fechas del evento. Muévalas o elimínelas antes de cambiarlo.');

        $this->assertSame('2026-12-06', $evento->refresh()->fecha_fin->format('Y-m-d'));
    }

    public function test_no_permite_acortar_horario_dejando_actividades_fuera(): void
    {
        $evento = $this->crearEvento();
        $this->crearActividad($evento, '2026-12-06', '16:00', '17:00');

        $this->patchJson("/api/eventos/{$evento->id_evento}", ['hora_fin' => '15:00'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['hora_inicio']);

        $this->assertSame('18:00', substr($evento->refresh()->hora_fin, 0, 5));
    }

    public function test_permite_cambiar_fechas_si_las_actividades_siguen_dentro(): void
    {
        $evento = $this->crearEvento();
        $this->crearActividad($evento, '2026-12-05', '10:00', '11:00');

        $this->patchJson("/api/eventos/{$evento->id_evento}", [
            'fecha_fin' => '2026-12-05',
            'hora_fin' => '12:00',
        ])->assertOk()
            ->assertJsonPath('data.fecha_fin', '2026-12-05');

        $sinActividades = $this->crearEvento(['nombre' => 'Sin actividades']);

        $this->patchJson("/api/eventos/{$sinActividades->id_evento}", ['fecha_fin' => '2026-12-04'])
            ->assertOk();
    }

    // DEF-CAL-004

    public function test_imagen_de_ubicacion_se_valida_con_foto_valida(): void
    {
        $grande = 'data:image/png;base64,' . base64_encode("\x89PNG\r\n\x1a\n" . str_repeat('a', 3 * 1024 * 1024));

        $this->postJson('/api/ubicaciones', ['nombre' => 'Plaza este', 'capacidad' => 100, 'imagen' => $grande])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['imagen']);

        $this->postJson('/api/ubicaciones', [
            'nombre' => 'Plaza oeste',
            'capacidad' => 100,
            'imagen' => 'data:image/gif;base64,' . base64_encode('GIF89a'),
        ])->assertStatus(422)
            ->assertJsonValidationErrors(['imagen']);

        $this->postJson('/api/ubicaciones', ['nombre' => 'Plaza norte', 'capacidad' => 100, 'imagen' => self::PNG])
            ->assertCreated();
    }

    public function test_editar_ubicacion_conserva_una_imagen_guardada_antes_de_la_regla(): void
    {
        $imagenAntigua = 'data:image/webp;base64,' . base64_encode('RIFF....WEBP');
        $ubicacion = Ubicacion::create(['nombre' => 'Gimnasio', 'capacidad' => 80, 'imagen' => $imagenAntigua]);

        $this->patchJson("/api/ubicaciones/{$ubicacion->id_ubicacion}", [
            'nombre' => 'Gimnasio',
            'capacidad' => 90,
            'imagen' => $imagenAntigua,
        ])->assertOk()
            ->assertJsonPath('data.capacidad', 90);

        $this->patchJson("/api/ubicaciones/{$ubicacion->id_ubicacion}", [
            'imagen' => 'data:image/gif;base64,' . base64_encode('GIF89a'),
        ])->assertStatus(422)
            ->assertJsonValidationErrors(['imagen']);
    }
}
