<?php

namespace Tests\Feature;

use App\Models\User;
use App\Modules\Beneficios\Models\Alimentacion;
use App\Modules\Beneficios\Models\Aula;
use App\Modules\Beneficios\Models\Mobiliario;
use App\Modules\Beneficios\Models\Ruta;
use App\Modules\Beneficios\Models\Transporte;
use App\Modules\SolicitudesAgrupaciones\Models\Agrupacion;
use App\Modules\SolicitudesAgrupaciones\Models\Encargado;
use App\Modules\SolicitudesAgrupaciones\Models\Estado;
use App\Modules\SolicitudesAgrupaciones\Models\SolicitudAgrupacion;
use App\Modules\Usuarios\Support\Modulos;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

/**
 * Regresión de DEF-BEN-001, DEF-BEN-003 y DEF-BEN-004 (registro de defectos de QA).
 */
class BeneficiosDefectosTest extends TestCase
{
    use RefreshDatabase;

    private Encargado $encargado;

    private Agrupacion $agrupacion;

    private Alimentacion $alimentacion;

    private Mobiliario $mobiliario;

    private Aula $aula;

    private Ruta $ruta;

    private Transporte $transporte;

    protected function setUp(): void
    {
        parent::setUp();

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $admin = User::create([
            'name' => 'Admin de prueba',
            'email' => 'admin-beneficios@ejemplo.com',
            'password' => 'secreto123',
            'activo' => true,
        ]);
        $admin->assignRole(Role::findOrCreate(Modulos::ROL_ADMIN, 'web'));
        Sanctum::actingAs($admin);

        $this->encargado = Encargado::create([
            'cedula' => '123456789',
            'tipo_identificacion' => 'cedula',
            'primer_nombre' => 'Usuario',
            'apellido' => 'Prueba',
            'email' => 'beneficios-defectos@test.com',
            'numero_tel' => '88880000',
        ]);

        $this->agrupacion = $this->crearAgrupacion('Banda Comunal', 22);

        $this->alimentacion = Alimentacion::create(['tiempo_comida' => 'Desayuno']);
        $this->mobiliario = Mobiliario::create(['nombre' => 'Silla', 'cantidad_disponible' => 50]);
        $this->aula = Aula::create(['nombre' => 'Aula 1', 'capacidad' => 30]);
        $this->ruta = Ruta::create(['nombre_ruta' => 'Ruta Centro']);
        $this->transporte = Transporte::create([
            'matricula' => 'ABC123',
            'tipo' => 'Bus',
            'capacidad' => 40,
            'cedula_conductor' => '112223333',
            'nombre_conductor' => 'Carlos',
            'apellido_conductor' => 'Rojas',
        ]);
    }

    private function crearAgrupacion(string $nombre, int $integrantes): Agrupacion
    {
        return Agrupacion::create([
            'ced_encargado' => $this->encargado->cedula,
            'nombre' => $nombre,
            'lugar_procedencia' => 'Guanacaste',
            'cantidad_integrantes' => $integrantes,
        ]);
    }

    private function crearSolicitudAprobada(Agrupacion $agrupacion, ?string $fechaAsignada = null): SolicitudAgrupacion
    {
        return SolicitudAgrupacion::create([
            'id_agrupacion' => $agrupacion->id,
            'ced_encargado' => $this->encargado->cedula,
            'fecha_solicitud' => now(),
            'fecha_asignada' => $fechaAsignada,
            'id_estado' => Estado::where('nom_estado', 'aprobada')->firstOrFail()->id,
        ]);
    }

    private function asignarTodo(SolicitudAgrupacion $solicitud): int
    {
        return $this->postJson('/api/asignaciones-beneficios', [
            'id_solicitud_agrupacion' => $solicitud->id,
            'mobiliarios' => [['id_mobiliario' => $this->mobiliario->id_mobiliario, 'cantidad' => 20]],
            'alimentaciones' => [['id_alimentacion' => $this->alimentacion->id_alimentacion]],
            'aulas' => [['id_aula' => $this->aula->id_aula]],
            'transportes' => [['matricula' => $this->transporte->matricula, 'id_ruta' => $this->ruta->id_ruta]],
        ])->assertCreated()->json('data.id');
    }

    // DEF-BEN-001

    public function test_eliminar_catalogos_asignados_responde_409_y_no_borra(): void
    {
        $this->asignarTodo($this->crearSolicitudAprobada($this->agrupacion));

        $casos = [
            ["/api/mobiliarios/{$this->mobiliario->id_mobiliario}", 'mobiliario', 'id_mobiliario', $this->mobiliario->id_mobiliario],
            ["/api/aulas/{$this->aula->id_aula}", 'aula', 'id_aula', $this->aula->id_aula],
            ["/api/alimentaciones/{$this->alimentacion->id_alimentacion}", 'alimentacion', 'id_alimentacion', $this->alimentacion->id_alimentacion],
            ["/api/rutas/{$this->ruta->id_ruta}", 'ruta', 'id_ruta', $this->ruta->id_ruta],
            ["/api/transportes/{$this->transporte->matricula}", 'transporte', 'matricula', $this->transporte->matricula],
        ];

        foreach ($casos as [$url, $tabla, $columna, $valor]) {
            $this->deleteJson($url)
                ->assertStatus(409)
                ->assertJsonPath('message', fn ($mensaje) => str_starts_with($mensaje, 'No se puede eliminar'));

            $this->assertDatabaseHas($tabla, [$columna => $valor]);
        }

        $this->assertDatabaseCount('asignacion_beneficios', 1);
        $this->assertDatabaseCount('asignacion_mobiliario', 1);
    }

    public function test_eliminar_catalogo_sin_uso_sigue_funcionando(): void
    {
        $ruta = Ruta::create(['nombre_ruta' => 'Ruta Norte']);

        $this->deleteJson("/api/rutas/{$ruta->id_ruta}")->assertOk();

        $this->assertDatabaseMissing('ruta', ['id_ruta' => $ruta->id_ruta]);
    }

    // DEF-BEN-003

    public function test_mover_asignacion_a_solicitud_con_asignacion_responde_422(): void
    {
        $solicitud1 = $this->crearSolicitudAprobada($this->agrupacion);
        $solicitud2 = $this->crearSolicitudAprobada($this->crearAgrupacion('Grupo Folclórico', 30));

        $asignacion1 = $this->asignarTodo($solicitud1);
        $this->postJson('/api/asignaciones-beneficios', [
            'id_solicitud_agrupacion' => $solicitud2->id,
        ])->assertCreated();

        $this->patchJson("/api/asignaciones-beneficios/{$asignacion1}", [
            'id_solicitud_agrupacion' => $solicitud2->id,
        ])->assertStatus(422)
            ->assertJsonValidationErrors([
                'id_solicitud_agrupacion' => 'La solicitud seleccionada ya tiene una asignación de beneficios.',
            ]);

        $this->assertDatabaseHas('asignacion_beneficios', [
            'id' => $asignacion1,
            'id_solicitud_agrupacion' => $solicitud1->id,
        ]);
    }

    public function test_reenviar_la_misma_solicitud_al_editar_sigue_siendo_valido(): void
    {
        $solicitud = $this->crearSolicitudAprobada($this->agrupacion);
        $asignacion = $this->asignarTodo($solicitud);

        $this->patchJson("/api/asignaciones-beneficios/{$asignacion}", [
            'id_solicitud_agrupacion' => $solicitud->id,
            'observaciones' => 'Sin cambio de solicitud',
        ])->assertOk()
            ->assertJsonPath('data.observaciones', 'Sin cambio de solicitud');
    }

    // DEF-BEN-004

    public function test_cambiar_integrantes_actualiza_raciones_de_asignaciones_vigentes(): void
    {
        $sinFecha = $this->asignarTodo($this->crearSolicitudAprobada($this->agrupacion));
        $futura = $this->asignarTodo($this->crearSolicitudAprobada($this->agrupacion, today()->addDays(10)->toDateString()));
        $pasada = $this->asignarTodo($this->crearSolicitudAprobada($this->agrupacion, today()->subYear()->toDateString()));

        $this->agrupacion->update(['cantidad_integrantes' => 30]);

        $this->assertDatabaseHas('asignacion_alimentacion', ['id_asignacion_beneficios' => $sinFecha, 'cantidad' => 30]);
        $this->assertDatabaseHas('asignacion_alimentacion', ['id_asignacion_beneficios' => $futura, 'cantidad' => 30]);
        $this->assertDatabaseHas('asignacion_alimentacion', ['id_asignacion_beneficios' => $pasada, 'cantidad' => 22]);
    }

    // CP-BEN-095: una solicitud con beneficios no se puede eliminar (ni en cascada).

    public function test_no_elimina_solicitud_agrupacion_ni_encargado_con_beneficios(): void
    {
        $solicitud = $this->crearSolicitudAprobada($this->agrupacion);
        $this->asignarTodo($solicitud);

        $this->deleteJson("/api/solicitudes-agrupaciones/{$solicitud->id}")
            ->assertStatus(422)
            ->assertJsonPath('message', 'No se puede eliminar la solicitud porque tiene beneficios asignados.');

        $this->deleteJson("/api/agrupaciones/{$this->agrupacion->id}")
            ->assertStatus(422)
            ->assertJsonPath('message', 'No se puede eliminar la agrupación porque una de sus solicitudes tiene beneficios asignados.');

        $this->deleteJson("/api/encargados/{$this->encargado->cedula}")
            ->assertStatus(422)
            ->assertJsonPath('message', 'No se puede eliminar el encargado porque una de sus solicitudes tiene beneficios asignados.');

        $this->assertDatabaseHas('solicitud_agrupacion', ['id' => $solicitud->id]);
        $this->assertDatabaseHas('agrupacion', ['id' => $this->agrupacion->id]);
        $this->assertDatabaseHas('encargado', ['cedula' => $this->encargado->cedula]);
        $this->assertDatabaseCount('asignacion_beneficios', 1);
    }

    public function test_elimina_solicitud_sin_beneficios(): void
    {
        $solicitud = $this->crearSolicitudAprobada($this->agrupacion);

        $this->deleteJson("/api/solicitudes-agrupaciones/{$solicitud->id}")->assertSuccessful();

        $this->assertDatabaseMissing('solicitud_agrupacion', ['id' => $solicitud->id]);
    }

    public function test_cambiar_otros_datos_de_la_agrupacion_no_toca_raciones(): void
    {
        $asignacion = $this->asignarTodo($this->crearSolicitudAprobada($this->agrupacion));

        $this->agrupacion->update(['lugar_procedencia' => 'Liberia']);

        $this->assertDatabaseHas('asignacion_alimentacion', ['id_asignacion_beneficios' => $asignacion, 'cantidad' => 22]);
    }
}
