<?php

namespace Tests\Feature;

use App\Modules\Calendario\Models\Actividad;
use App\Modules\Calendario\Models\EstadoActividad;
use App\Modules\Calendario\Models\Evento;
use App\Modules\Calendario\Models\Ubicacion;
use App\Modules\SolicitudesAgrupaciones\Models\Agrupacion;
use App\Modules\SolicitudesAgrupaciones\Models\Encargado;
use App\Modules\SolicitudesAgrupaciones\Models\Estado;
use App\Modules\SolicitudesAgrupaciones\Models\SolicitudAgrupacion;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
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

    private function aprobarAgrupacionEnEvento(Evento $evento, string $estado = 'aprobada'): void
    {
        SolicitudAgrupacion::create([
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

    public function test_valida_choque_de_horario_en_la_misma_ubicacion(): void
    {
        $this->crearActividad();

        $this->postJson('/api/actividades', $this->datosActividad([
            'hora_inicio' => '10:30',
            'hora_finalizacion' => '11:30',
        ]))->assertStatus(422)
            ->assertJsonValidationErrors(['id_ubicacion']);

        // Horarios contiguos no chocan.
        $this->crearActividad([
            'hora_inicio' => '11:00',
            'hora_finalizacion' => '12:00',
        ]);

        // Otra fecha u otra ubicación no chocan.
        $this->crearActividad(['fecha' => '2026-10-11']);
        $this->crearActividad(['id_ubicacion' => null]);

        $this->assertDatabaseCount('actividad', 4);
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
            ->assertJsonValidationErrors(['id_ubicacion']);

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

        // Mismo evento, misma fecha y ubicación: choca con la original.
        $this->postJson("/api/actividades/{$original['id_actividad']}/duplicar", [
            'id_evento' => $this->evento->id_evento,
            'fecha' => '2026-10-10',
        ])->assertStatus(422)
            ->assertJsonValidationErrors(['id_ubicacion']);

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
