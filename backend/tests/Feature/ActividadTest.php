<?php

namespace Tests\Feature;

use App\Models\User;
use App\Modules\Calendario\Models\Actividad;
use App\Modules\Calendario\Models\EstadoActividad;
use App\Modules\Calendario\Models\Evento;
use App\Modules\Calendario\Models\Ubicacion;
use App\Modules\SolicitudesAgrupaciones\Models\Agrupacion;
use App\Modules\SolicitudesAgrupaciones\Models\Encargado;
use App\Modules\SolicitudesAgrupaciones\Models\Estado;
use App\Modules\SolicitudesAgrupaciones\Models\SolicitudAgrupacion;
use App\Modules\Usuarios\Support\Modulos;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class ActividadTest extends TestCase
{
    use RefreshDatabase;

    private Evento $evento;

    private Evento $otroEvento;

    private Ubicacion $ubicacion;

    private Agrupacion $agrupacion;

    protected function setUp(): void
    {
        parent::setUp();

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $admin = User::create([
            'name' => 'Admin de prueba',
            'email' => 'admin-actividades@ejemplo.com',
            'password' => 'secreto123',
            'activo' => true,
        ]);
        $admin->assignRole(Role::findOrCreate(Modulos::ROL_ADMIN, 'web'));
        Sanctum::actingAs($admin);

        Carbon::setTestNow('2026-10-01 08:00:00');

        $this->evento = Evento::create([
            'nombre' => 'Festival de Primavera',
            'fecha_inicio' => '2026-10-10',
            'fecha_fin' => '2026-10-12',
        ]);

        $this->otroEvento = Evento::create([
            'nombre' => 'Festival de Invierno',
            'fecha_inicio' => '2026-12-01',
            'fecha_fin' => '2026-12-02',
        ]);

        $this->ubicacion = Ubicacion::create([
            'nombre' => 'Tarima Principal',
            'capacidad' => 300,
        ]);

        $encargado = Encargado::create([
            'cedula' => '123456789',
            'tipo_identificacion' => 'cedula',
            'primer_nombre' => 'Usuario',
            'apellido' => 'Prueba',
            'email' => 'actividades@test.com',
            'numero_tel' => '88880000',
        ]);

        $this->agrupacion = Agrupacion::create([
            'ced_encargado' => $encargado->cedula,
            'nombre' => 'Grupo de Baile',
            'lugar_procedencia' => 'Guanacaste',
            'cantidad_integrantes' => 20,
        ]);
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();

        parent::tearDown();
    }

    private function aprobarAgrupacionEnEvento(Evento $evento, string $estado = 'aprobada'): SolicitudAgrupacion
    {
        return SolicitudAgrupacion::create([
            'id_agrupacion' => $this->agrupacion->id,
            'id_evento' => $evento->id_evento,
            'fecha_solicitud' => now(),
            'id_estado' => Estado::where('nom_estado', $estado)->firstOrFail()->id,
        ]);
    }

    private function datosActividad(array $cambios = []): array
    {
        return array_merge([
            'titulo' => 'Presentación de apertura',
            'fecha' => '2026-10-10',
            'hora_inicio' => '10:00',
            'hora_finalizacion' => '11:00',
            'id_evento' => $this->evento->id_evento,
            'id_ubicacion' => $this->ubicacion->id_ubicacion,
        ], $cambios);
    }

    private function crearActividad(array $cambios = []): array
    {
        return $this->postJson('/api/actividades', $this->datosActividad($cambios))
            ->assertCreated()
            ->json('data');
    }

    public function test_crea_y_lista_actividades_de_un_evento(): void
    {
        $this->aprobarAgrupacionEnEvento($this->evento);

        $this->postJson('/api/actividades', $this->datosActividad([
            'id_agrupacion' => $this->agrupacion->id,
        ]))->assertCreated()
            ->assertJsonPath('data.titulo', 'Presentación de apertura')
            ->assertJsonPath('data.fecha', '2026-10-10')
            ->assertJsonPath('data.hora_inicio', '10:00')
            ->assertJsonPath('data.hora_finalizacion', '11:00')
            ->assertJsonPath('data.ubicacion.nombre', 'Tarima Principal')
            ->assertJsonPath('data.agrupacion.nombre', 'Grupo de Baile')
            ->assertJsonPath('data.estado.nombre', EstadoActividad::PROXIMAMENTE);

        $this->crearActividad([
            'titulo' => 'Cierre',
            'fecha' => '2026-10-12',
            'id_ubicacion' => null,
        ]);

        $this->crearActividad([
            'id_evento' => $this->otroEvento->id_evento,
            'fecha' => '2026-12-01',
        ]);

        $this->getJson("/api/eventos/{$this->evento->id_evento}/actividades")
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.titulo', 'Presentación de apertura')
            ->assertJsonPath('data.1.titulo', 'Cierre')
            ->assertJsonPath('data.1.ubicacion', null)
            ->assertJsonPath('data.1.agrupacion', null);

        $this->getJson('/api/actividades')
            ->assertOk()
            ->assertJsonCount(3, 'data');
    }

    public function test_estado_se_calcula_y_actualiza_automaticamente(): void
    {
        $actividad = $this->crearActividad();

        $this->assertSame(EstadoActividad::PROXIMAMENTE, $actividad['estado']['nombre']);

        Carbon::setTestNow('2026-10-10 10:30:00');
        $this->getJson("/api/actividades/{$actividad['id_actividad']}")
            ->assertOk()
            ->assertJsonPath('data.estado.nombre', EstadoActividad::EN_PROGRESO);

        Carbon::setTestNow('2026-10-10 11:00:00');
        $this->getJson("/api/eventos/{$this->evento->id_evento}/actividades")
            ->assertOk()
            ->assertJsonPath('data.0.estado.nombre', EstadoActividad::FINALIZADA);

        $this->assertSame(
            EstadoActividad::FINALIZADA,
            Actividad::find($actividad['id_actividad'])->estado->nombre
        );
    }

    public function test_listar_sincroniza_estados_en_bloque(): void
    {
        $terminada = $this->crearActividad(['hora_inicio' => '08:00', 'hora_finalizacion' => '09:00']);
        $enCurso = $this->crearActividad(['hora_inicio' => '09:00', 'hora_finalizacion' => '11:00']);
        $siguiente = $this->crearActividad(['hora_inicio' => '11:00', 'hora_finalizacion' => '12:00']);
        $otroDia = $this->crearActividad(['fecha' => '2026-10-11']);

        Carbon::setTestNow('2026-10-10 10:00:00');

        DB::enableQueryLog();
        $respuesta = $this->getJson('/api/actividades')->assertOk();
        $actualizaciones = collect(DB::getQueryLog())
            ->filter(fn (array $consulta) => str_starts_with(strtolower($consulta['query']), 'update'));
        DB::disableQueryLog();

        // Siempre 3 UPDATE (uno por estado), sin importar cuántas actividades haya.
        $this->assertCount(3, $actualizaciones);

        $estados = collect($respuesta->json('data'))->pluck('estado.nombre', 'id_actividad');
        $this->assertSame(EstadoActividad::FINALIZADA, $estados[$terminada['id_actividad']]);
        $this->assertSame(EstadoActividad::EN_PROGRESO, $estados[$enCurso['id_actividad']]);
        $this->assertSame(EstadoActividad::PROXIMAMENTE, $estados[$siguiente['id_actividad']]);
        $this->assertSame(EstadoActividad::PROXIMAMENTE, $estados[$otroDia['id_actividad']]);
    }

    public function test_no_permite_elegir_estado_manualmente(): void
    {
        $this->postJson('/api/actividades', $this->datosActividad([
            'id_estado_actividad' => 1,
        ]))->assertStatus(422)
            ->assertJsonValidationErrors(['id_estado_actividad']);
    }

    public function test_valida_horas_y_fecha_dentro_del_evento(): void
    {
        $this->postJson('/api/actividades', $this->datosActividad([
            'hora_inicio' => '11:00',
            'hora_finalizacion' => '10:00',
        ]))->assertStatus(422)
            ->assertJsonValidationErrors(['hora_finalizacion']);

        $this->postJson('/api/actividades', $this->datosActividad([
            'fecha' => '2026-10-09',
        ]))->assertStatus(422)
            ->assertJsonValidationErrors(['fecha']);

        $this->postJson('/api/actividades', $this->datosActividad([
            'fecha' => '2026-10-13',
        ]))->assertStatus(422)
            ->assertJsonValidationErrors(['fecha']);

        $this->assertDatabaseCount('actividad', 0);
    }

    public function test_valida_horas_dentro_del_horario_del_evento(): void
    {
        // El evento va del 10 al 12, de 08:00 a 14:00 todos los días.
        $this->evento->update(['hora_inicio' => '08:00', 'hora_fin' => '14:00']);

        // Cualquier día del evento (también los intermedios) respeta el horario.
        $this->postJson('/api/actividades', $this->datosActividad([
            'fecha' => '2026-10-11',
            'hora_inicio' => '07:30',
            'hora_finalizacion' => '09:00',
        ]))->assertStatus(422)
            ->assertJsonValidationErrors(['hora_inicio']);

        $this->postJson('/api/actividades', $this->datosActividad([
            'hora_inicio' => '13:30',
            'hora_finalizacion' => '14:30',
        ]))->assertStatus(422)
            ->assertJsonValidationErrors(['hora_finalizacion']);

        // Los límites exactos son válidos en cualquier día.
        $this->crearActividad(['hora_inicio' => '08:00', 'hora_finalizacion' => '09:00']);
        $this->crearActividad(['fecha' => '2026-10-11', 'hora_inicio' => '13:00', 'hora_finalizacion' => '14:00']);
        $this->crearActividad(['fecha' => '2026-10-12', 'hora_inicio' => '08:00', 'hora_finalizacion' => '14:00']);

        // Un evento de todo el día no limita las horas.
        $this->evento->update(['todo_el_dia' => true]);
        $this->crearActividad(['hora_inicio' => '06:00', 'hora_finalizacion' => '07:00']);

        $this->assertDatabaseCount('actividad', 4);
    }

    public function test_valida_choque_de_horario_en_la_misma_fecha(): void
    {
        $this->crearActividad();
        $otraUbicacion = Ubicacion::create(['nombre' => 'Tarima Secundaria', 'capacidad' => 100]);

        // Choca sin importar la ubicación, y también si el rango contiene al existente.
        $choques = [
            ['hora_inicio' => '10:30', 'hora_finalizacion' => '11:30'],
            ['hora_inicio' => '10:30', 'hora_finalizacion' => '11:30', 'id_ubicacion' => $otraUbicacion->id_ubicacion],
            ['hora_inicio' => '10:30', 'hora_finalizacion' => '11:30', 'id_ubicacion' => null],
            ['hora_inicio' => '09:00', 'hora_finalizacion' => '12:00'],
        ];

        foreach ($choques as $cambios) {
            $this->postJson('/api/actividades', $this->datosActividad($cambios))
                ->assertStatus(422)
                ->assertJsonValidationErrors(['hora_inicio']);
        }

        // Horarios contiguos no chocan.
        $this->crearActividad([
            'hora_inicio' => '11:00',
            'hora_finalizacion' => '12:00',
        ]);

        // Otra fecha no choca.
        $this->crearActividad(['fecha' => '2026-10-11']);

        $this->assertDatabaseCount('actividad', 3);
    }

    public function test_valida_que_la_agrupacion_este_aprobada_en_el_evento(): void
    {
        $this->postJson('/api/actividades', $this->datosActividad([
            'id_agrupacion' => $this->agrupacion->id,
        ]))->assertStatus(422)
            ->assertJsonValidationErrors(['id_agrupacion']);

        $this->aprobarAgrupacionEnEvento($this->evento, 'pendiente');
        $this->aprobarAgrupacionEnEvento($this->otroEvento);

        $this->postJson('/api/actividades', $this->datosActividad([
            'id_agrupacion' => $this->agrupacion->id,
        ]))->assertStatus(422)
            ->assertJsonValidationErrors(['id_agrupacion']);

        $this->aprobarAgrupacionEnEvento($this->evento);

        $this->postJson('/api/actividades', $this->datosActividad([
            'id_agrupacion' => $this->agrupacion->id,
        ]))->assertCreated();
    }

    public function test_actualiza_actividad_validando_con_los_datos_completos(): void
    {
        $actividad = $this->crearActividad();
        $otra = $this->crearActividad([
            'titulo' => 'Segunda',
            'hora_inicio' => '12:00',
            'hora_finalizacion' => '13:00',
        ]);

        // Editar sin cambiar horario no choca consigo misma.
        $this->patchJson("/api/actividades/{$actividad['id_actividad']}", [
            'titulo' => 'Apertura oficial',
        ])->assertOk()
            ->assertJsonPath('data.titulo', 'Apertura oficial')
            ->assertJsonPath('data.hora_inicio', '10:00');

        $this->patchJson("/api/actividades/{$otra['id_actividad']}", [
            'hora_inicio' => '10:30',
        ])->assertStatus(422)
            ->assertJsonValidationErrors(['hora_inicio']);

        $this->patchJson("/api/actividades/{$otra['id_actividad']}", [
            'hora_finalizacion' => '11:30',
        ])->assertStatus(422)
            ->assertJsonValidationErrors(['hora_finalizacion']);

        $this->patchJson("/api/actividades/{$otra['id_actividad']}", [
            'fecha' => '2026-11-01',
        ])->assertStatus(422)
            ->assertJsonValidationErrors(['fecha']);

        $this->patchJson("/api/actividades/{$otra['id_actividad']}", [
            'id_evento' => $this->otroEvento->id_evento,
        ])->assertStatus(422)
            ->assertJsonValidationErrors(['id_evento']);
    }

    public function test_elimina_actividad(): void
    {
        $actividad = $this->crearActividad();

        $this->deleteJson("/api/actividades/{$actividad['id_actividad']}")
            ->assertOk();

        $this->assertDatabaseMissing('actividad', ['id_actividad' => $actividad['id_actividad']]);
    }

    public function test_duplica_actividad_a_otro_evento(): void
    {
        $this->aprobarAgrupacionEnEvento($this->evento);
        $this->aprobarAgrupacionEnEvento($this->otroEvento);

        $original = $this->crearActividad(['id_agrupacion' => $this->agrupacion->id]);
        $otraUbicacion = Ubicacion::create(['nombre' => 'Gimnasio', 'capacidad' => 500]);

        $this->postJson("/api/actividades/{$original['id_actividad']}/duplicar", [
            'id_evento' => $this->otroEvento->id_evento,
            'fecha' => '2026-12-02',
            'hora_inicio' => '15:00',
            'hora_finalizacion' => '16:00',
            'id_ubicacion' => $otraUbicacion->id_ubicacion,
        ])->assertCreated()
            ->assertJsonPath('data.titulo', 'Presentación de apertura')
            ->assertJsonPath('data.id_evento', $this->otroEvento->id_evento)
            ->assertJsonPath('data.fecha', '2026-12-02')
            ->assertJsonPath('data.hora_inicio', '15:00')
            ->assertJsonPath('data.ubicacion.nombre', 'Gimnasio')
            ->assertJsonPath('data.agrupacion.nombre', 'Grupo de Baile');

        // La original sigue en su evento.
        $this->assertDatabaseHas('actividad', [
            'id_actividad' => $original['id_actividad'],
            'id_evento' => $this->evento->id_evento,
        ]);

        // Sin overrides se copian horas y ubicación.
        $this->postJson("/api/actividades/{$original['id_actividad']}/duplicar", [
            'id_evento' => $this->otroEvento->id_evento,
            'fecha' => '2026-12-01',
        ])->assertCreated()
            ->assertJsonPath('data.hora_inicio', '10:00')
            ->assertJsonPath('data.hora_finalizacion', '11:00')
            ->assertJsonPath('data.id_ubicacion', $this->ubicacion->id_ubicacion);
    }

    public function test_duplicar_sin_agrupacion_aprobada_en_destino_la_copia_sin_agrupacion(): void
    {
        $this->aprobarAgrupacionEnEvento($this->evento);
        $original = $this->crearActividad(['id_agrupacion' => $this->agrupacion->id]);

        $this->postJson("/api/actividades/{$original['id_actividad']}/duplicar", [
            'id_evento' => $this->otroEvento->id_evento,
            'fecha' => '2026-12-01',
        ])->assertCreated()
            ->assertJsonPath('data.id_agrupacion', null)
            ->assertJsonPath('data.agrupacion', null);
    }

    public function test_duplicar_aplica_validaciones(): void
    {
        $original = $this->crearActividad();

        $this->postJson("/api/actividades/{$original['id_actividad']}/duplicar", [
            'id_evento' => $this->otroEvento->id_evento,
            'fecha' => '2026-10-10',
        ])->assertStatus(422)
            ->assertJsonValidationErrors(['fecha']);

        // Mismo evento, misma fecha y horario: choca con la original.
        $this->postJson("/api/actividades/{$original['id_actividad']}/duplicar", [
            'id_evento' => $this->evento->id_evento,
            'fecha' => '2026-10-10',
        ])->assertStatus(422)
            ->assertJsonValidationErrors(['hora_inicio']);

        $this->postJson("/api/actividades/{$original['id_actividad']}/duplicar", [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['id_evento', 'fecha']);
    }

    public function test_eliminar_evento_elimina_sus_actividades(): void
    {
        $actividad = $this->crearActividad();

        $this->deleteJson("/api/eventos/{$this->evento->id_evento}")
            ->assertOk();

        $this->assertDatabaseMissing('actividad', ['id_actividad' => $actividad['id_actividad']]);
    }

    public function test_lista_agrupaciones_aprobadas_del_evento(): void
    {
        $encargado = $this->agrupacion->encargado;
        $pendiente = Agrupacion::create([
            'ced_encargado' => $encargado->cedula,
            'nombre' => 'Coro Juvenil',
            'lugar_procedencia' => 'Liberia',
            'cantidad_integrantes' => 15,
        ]);
        $deOtroEvento = Agrupacion::create([
            'ced_encargado' => $encargado->cedula,
            'nombre' => 'Banda Municipal',
            'lugar_procedencia' => 'Nicoya',
            'cantidad_integrantes' => 30,
        ]);

        // Dos solicitudes aprobadas de la misma agrupación no la duplican.
        $this->aprobarAgrupacionEnEvento($this->evento);
        $this->aprobarAgrupacionEnEvento($this->evento);

        $estado = fn (string $nombre) => Estado::where('nom_estado', $nombre)->firstOrFail()->id;
        SolicitudAgrupacion::create([
            'id_agrupacion' => $pendiente->id,
            'id_evento' => $this->evento->id_evento,
            'fecha_solicitud' => now(),
            'id_estado' => $estado('pendiente'),
        ]);
        SolicitudAgrupacion::create([
            'id_agrupacion' => $deOtroEvento->id,
            'id_evento' => $this->otroEvento->id_evento,
            'fecha_solicitud' => now(),
            'id_estado' => $estado('aprobada'),
        ]);

        $this->getJson("/api/eventos/{$this->evento->id_evento}/agrupaciones-aprobadas")
            ->assertOk()
            ->assertExactJson([
                'data' => [
                    ['id' => $this->agrupacion->id, 'nombre' => 'Grupo de Baile'],
                ],
            ]);
    }

    private function assertHorarioAsignado(SolicitudAgrupacion $solicitud, ?string $fecha, ?string $hora): void
    {
        $solicitud->refresh();

        $this->assertSame($fecha, $solicitud->fecha_asignada?->format('Y-m-d'));
        $this->assertSame($hora, $solicitud->hora_asignada ? substr($solicitud->hora_asignada, 0, 5) : null);
    }

    public function test_crear_actividad_asigna_su_horario_a_la_solicitud(): void
    {
        $solicitud = $this->aprobarAgrupacionEnEvento($this->evento);

        $this->crearActividad([
            'id_agrupacion' => $this->agrupacion->id,
            'fecha' => '2026-10-11',
            'hora_inicio' => '08:00',
            'hora_finalizacion' => '08:30',
        ]);

        $this->assertHorarioAsignado($solicitud, '2026-10-11', '08:00');
    }

    public function test_horario_asignado_es_el_de_la_primera_actividad(): void
    {
        $solicitud = $this->aprobarAgrupacionEnEvento($this->evento);

        $this->crearActividad(['id_agrupacion' => $this->agrupacion->id, 'fecha' => '2026-10-11']);
        $this->crearActividad([
            'id_agrupacion' => $this->agrupacion->id,
            'hora_inicio' => '14:00',
            'hora_finalizacion' => '15:00',
        ]);

        $this->assertHorarioAsignado($solicitud, '2026-10-10', '14:00');
    }

    public function test_editar_actividad_recalcula_el_horario_asignado(): void
    {
        $solicitud = $this->aprobarAgrupacionEnEvento($this->evento);
        $actividad = $this->crearActividad(['id_agrupacion' => $this->agrupacion->id]);

        $this->patchJson("/api/actividades/{$actividad['id_actividad']}", [
            'hora_inicio' => '09:00',
            'hora_finalizacion' => '09:30',
        ])->assertOk();

        $this->assertHorarioAsignado($solicitud, '2026-10-10', '09:00');

        $this->patchJson("/api/actividades/{$actividad['id_actividad']}", [
            'id_agrupacion' => null,
        ])->assertOk();

        $this->assertHorarioAsignado($solicitud, null, null);
    }

    public function test_cambiar_agrupacion_mueve_el_horario_asignado(): void
    {
        $anterior = $this->aprobarAgrupacionEnEvento($this->evento);
        $actividad = $this->crearActividad(['id_agrupacion' => $this->agrupacion->id]);

        $nueva = Agrupacion::create([
            'ced_encargado' => $this->agrupacion->ced_encargado,
            'nombre' => 'Coro Juvenil',
            'lugar_procedencia' => 'Liberia',
            'cantidad_integrantes' => 15,
        ]);
        $solicitudNueva = SolicitudAgrupacion::create([
            'id_agrupacion' => $nueva->id,
            'id_evento' => $this->evento->id_evento,
            'fecha_solicitud' => now(),
            'id_estado' => Estado::where('nom_estado', 'aprobada')->firstOrFail()->id,
        ]);

        $this->patchJson("/api/actividades/{$actividad['id_actividad']}", [
            'id_agrupacion' => $nueva->id,
        ])->assertOk();

        $this->assertHorarioAsignado($anterior, null, null);
        $this->assertHorarioAsignado($solicitudNueva, '2026-10-10', '10:00');
    }

    public function test_eliminar_actividad_libera_el_horario_asignado(): void
    {
        $solicitud = $this->aprobarAgrupacionEnEvento($this->evento);
        $actividad = $this->crearActividad(['id_agrupacion' => $this->agrupacion->id]);

        $this->deleteJson("/api/actividades/{$actividad['id_actividad']}")->assertOk();

        $this->assertHorarioAsignado($solicitud, null, null);
    }

    public function test_actividad_sin_agrupacion_no_modifica_solicitudes(): void
    {
        $solicitud = $this->aprobarAgrupacionEnEvento($this->evento);

        $this->crearActividad();

        $this->assertHorarioAsignado($solicitud, null, null);
    }

    public function test_lista_estados_de_actividad(): void
    {
        $this->getJson('/api/estados-actividad')
            ->assertOk()
            ->assertJsonCount(3, 'data')
            ->assertJsonPath('data.0.nombre', EstadoActividad::PROXIMAMENTE)
            ->assertJsonPath('data.1.nombre', EstadoActividad::EN_PROGRESO)
            ->assertJsonPath('data.2.nombre', EstadoActividad::FINALIZADA);
    }
}
