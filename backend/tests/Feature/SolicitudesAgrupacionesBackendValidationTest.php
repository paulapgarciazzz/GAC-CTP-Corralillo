<?php

namespace Tests\Feature;

use App\Modules\SolicitudesAgrupaciones\Models\Agrupacion;
use App\Modules\SolicitudesAgrupaciones\Models\Encargado;
use App\Modules\SolicitudesAgrupaciones\Models\Estado;
use App\Modules\SolicitudesAgrupaciones\Models\SolicitudAgrupacion;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SolicitudesAgrupacionesBackendValidationTest extends TestCase
{
    use RefreshDatabase;

    private const PNG_1X1 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

    private function crearEstadoPendiente(): void
    {
        $this->assertDatabaseHas('estado', ['nom_estado' => 'pendiente']);
        $this->assertDatabaseHas('estado', ['nom_estado' => 'aprobada']);
        $this->assertDatabaseHas('estado', ['nom_estado' => 'rechazada']);
    }

    private function baseEncargado(array $overrides = []): array
    {
        return array_merge([
            'cedula' => '123456789',
            'tipo_identificacion' => 'cedula',
            'primer_nombre' => 'Juan',
            'apellido' => 'García',
            'email' => 'juan.garcia@example.com',
            'numero_tel' => '88889999',
        ], $overrides);
    }

    private function baseAgrupacion(string $cedula, array $overrides = []): array
    {
        return array_merge([
            'ced_encargado' => $cedula,
            'nombre' => 'Agrupación A',
            'lugar_procedencia' => 'San José',
            'cantidad_integrantes' => 12,
            'resena' => 'Reseña inicial',
            'archivo_adjunto' => 'data:image/png;base64,' . self::PNG_1X1,
        ], $overrides);
    }

    private function baseSolicitudCompleta(array $overrides = []): array
    {
        return array_replace_recursive([
            'encargado' => $this->baseEncargado(),
            'agrupacion' => $this->baseAgrupacion('123456789'),
            'solicitud' => [
                'fecha_solicitada' => '2026-09-20',
                'hora_solicitada' => '10:30',
                'comentarios' => 'Solicitud de participación.',
            ],
        ], $overrides);
    }

    public function test_no_se_pueden_crear_dos_encargados_con_la_misma_cedula(): void
    {
        $this->postJson('/api/encargados', $this->baseEncargado());

        $response = $this->postJson('/api/encargados', $this->baseEncargado([
            'email' => 'otro@example.com',
            'numero_tel' => '22223333',
        ]));

        $response->assertStatus(422)
            ->assertJsonPath('errors.cedula.0', 'Esta cédula ya está registrada. Si ya ha participado anteriormente, seleccione la opción \'Sí, ya he participado\'.');
    }

    public function test_no_se_pueden_crear_dos_encargados_con_el_mismo_email(): void
    {
        $this->postJson('/api/encargados', $this->baseEncargado());

        $response = $this->postJson('/api/encargados', $this->baseEncargado([
            'cedula' => '987654321',
            'numero_tel' => '33334444',
            'email' => 'juan.garcia@example.com',
        ]));

        $response->assertStatus(422)
            ->assertJsonPath('errors.email.0', 'Este correo electrónico ya está registrado.');
    }

    public function test_no_se_pueden_crear_dos_encargados_con_el_mismo_telefono(): void
    {
        $this->postJson('/api/encargados', $this->baseEncargado());

        $response = $this->postJson('/api/encargados', $this->baseEncargado([
            'cedula' => '987654321',
            'email' => 'otro@example.com',
            'numero_tel' => '88889999',
        ]));

        $response->assertStatus(422)
            ->assertJsonPath('errors.numero_tel.0', 'Este número de teléfono ya está registrado.');
    }

    public function test_encargado_puede_actualizar_primer_nombre(): void
    {
        $encargado = Encargado::create($this->baseEncargado());

        $response = $this->patchJson("/api/encargados/{$encargado->cedula}", [
            'primer_nombre' => 'Pedro',
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('encargado', [
            'cedula' => $encargado->cedula,
            'primer_nombre' => 'Pedro',
        ]);
    }

    public function test_encargado_puede_actualizar_apellido(): void
    {
        $encargado = Encargado::create($this->baseEncargado());

        $this->patchJson("/api/encargados/{$encargado->cedula}", [
            'apellido' => 'Martínez',
        ])->assertOk();

        $this->assertDatabaseHas('encargado', [
            'cedula' => $encargado->cedula,
            'apellido' => 'Martínez',
        ]);
    }

    public function test_encargado_puede_actualizar_email(): void
    {
        $encargado = Encargado::create($this->baseEncargado());

        $this->patchJson("/api/encargados/{$encargado->cedula}", [
            'email' => 'nuevo@example.com',
        ])->assertOk();

        $this->assertDatabaseHas('encargado', [
            'cedula' => $encargado->cedula,
            'email' => 'nuevo@example.com',
        ]);
    }

    public function test_encargado_puede_actualizar_numero_tel(): void
    {
        $encargado = Encargado::create($this->baseEncargado());

        $this->patchJson("/api/encargados/{$encargado->cedula}", [
            'numero_tel' => '77778888',
        ])->assertOk();

        $this->assertDatabaseHas('encargado', [
            'cedula' => $encargado->cedula,
            'numero_tel' => '77778888',
        ]);
    }

    public function test_mantener_el_mismo_email_no_falla_unique(): void
    {
        $encargado = Encargado::create($this->baseEncargado());

        $this->patchJson("/api/encargados/{$encargado->cedula}", [
            'email' => $encargado->email,
        ])->assertOk();
    }

    public function test_mantener_el_mismo_telefono_no_falla_unique(): void
    {
        $encargado = Encargado::create($this->baseEncargado());

        $this->patchJson("/api/encargados/{$encargado->cedula}", [
            'numero_tel' => $encargado->numero_tel,
        ])->assertOk();
    }

    public function test_no_se_puede_modificar_la_cedula(): void
    {
        $encargado = Encargado::create($this->baseEncargado());

        $response = $this->patchJson("/api/encargados/{$encargado->cedula}", [
            'cedula' => '999999999',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('errors.cedula.0', 'La cédula no puede modificarse.');
    }

    public function test_no_se_puede_actualizar_email_por_uno_de_otro_encargado(): void
    {
        Encargado::create($this->baseEncargado());
        $otro = Encargado::create($this->baseEncargado([
            'cedula' => '987654321',
            'email' => 'otro@example.com',
            'numero_tel' => '55556666',
        ]));

        $response = $this->patchJson('/api/encargados/123456789', [
            'email' => $otro->email,
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('errors.email.0', 'Este correo electrónico ya está registrado.');
    }

    public function test_no_se_puede_actualizar_telefono_por_uno_de_otro_encargado(): void
    {
        Encargado::create($this->baseEncargado());
        $otro = Encargado::create($this->baseEncargado([
            'cedula' => '987654321',
            'email' => 'otro@example.com',
            'numero_tel' => '55556666',
        ]));

        $response = $this->patchJson('/api/encargados/123456789', [
            'numero_tel' => $otro->numero_tel,
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('errors.numero_tel.0', 'Este número de teléfono ya está registrado.');
    }

    public function test_un_encargado_puede_tener_varias_agrupaciones(): void
    {
        $encargado = Encargado::create($this->baseEncargado());

        $this->postJson('/api/agrupaciones', $this->baseAgrupacion($encargado->cedula, ['nombre' => 'Agrupación A']))->assertCreated();
        $this->postJson('/api/agrupaciones', $this->baseAgrupacion($encargado->cedula, ['nombre' => 'Agrupación B']))->assertCreated();

        $this->assertEquals(2, Agrupacion::where('ced_encargado', $encargado->cedula)->count());
    }

    public function test_dos_agrupaciones_pueden_tener_el_mismo_nombre(): void
    {
        $encargado = Encargado::create($this->baseEncargado());
        $otro = Encargado::create($this->baseEncargado([
            'cedula' => '987654321',
            'email' => 'otro@example.com',
            'numero_tel' => '55556666',
        ]));

        $this->postJson('/api/agrupaciones', $this->baseAgrupacion($encargado->cedula, ['nombre' => 'Mismo nombre']))->assertCreated();
        $this->postJson('/api/agrupaciones', $this->baseAgrupacion($otro->cedula, ['nombre' => 'Mismo nombre']))->assertCreated();

        $this->assertEquals(2, Agrupacion::where('nombre', 'Mismo nombre')->count());
    }

    public function test_agrupacion_existente_puede_modificar_lugar_procedencia_cantidad_integrantes_y_resena(): void
    {
        $encargado = Encargado::create($this->baseEncargado());
        $agrupacion = Agrupacion::create($this->baseAgrupacion($encargado->cedula));

        $response = $this->patchJson("/api/agrupaciones/{$agrupacion->id}", [
            'lugar_procedencia' => 'Cartago',
            'cantidad_integrantes' => 20,
            'resena' => 'Nueva reseña',
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('agrupacion', [
            'id' => $agrupacion->id,
            'lugar_procedencia' => 'Cartago',
            'cantidad_integrantes' => 20,
            'resena' => 'Nueva reseña',
        ]);
    }

    public function test_no_se_puede_modificar_nombre_ni_ced_encargado_de_agrupacion_existente(): void
    {
        $encargado = Encargado::create($this->baseEncargado());
        $agrupacion = Agrupacion::create($this->baseAgrupacion($encargado->cedula));

        $response = $this->patchJson("/api/agrupaciones/{$agrupacion->id}", [
            'nombre' => 'Cambio de nombre',
            'ced_encargado' => '987654321',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('errors.nombre.0', 'El nombre no puede modificarse.');
    }

    public function test_una_agrupacion_puede_tener_multiples_solicitudes(): void
    {
        $this->crearEstadoPendiente();
        $encargado = Encargado::create($this->baseEncargado());
        $agrupacion = Agrupacion::create($this->baseAgrupacion($encargado->cedula));

        $this->postJson('/api/solicitudes-agrupaciones', [
            'id_agrupacion' => $agrupacion->id,
            'fecha_solicitud' => '2026-09-08',
            'comentarios' => 'Primera solicitud',
        ])->assertCreated();

        $this->postJson('/api/solicitudes-agrupaciones', [
            'id_agrupacion' => $agrupacion->id,
            'fecha_solicitud' => '2026-09-09',
            'comentarios' => 'Segunda solicitud',
        ])->assertCreated();

        $this->assertEquals(2, SolicitudAgrupacion::where('id_agrupacion', $agrupacion->id)->count());
    }

    public function test_get_encargado_por_cedula_devuelve_el_encargado_correcto(): void
    {
        Encargado::create($this->baseEncargado());

        $response = $this->getJson('/api/encargados/123456789');

        $response->assertOk()
            ->assertJsonPath('data.cedula', '123456789')
            ->assertJsonPath('data.email', 'juan.garcia@example.com');
    }

    public function test_get_agrupaciones_por_cedula_devuelve_solo_las_agrupaciones_de_ese_encargado(): void
    {
        $encargado = Encargado::create($this->baseEncargado());
        $otro = Encargado::create($this->baseEncargado([
            'cedula' => '987654321',
            'email' => 'otro@example.com',
            'numero_tel' => '55556666',
        ]));

        Agrupacion::create($this->baseAgrupacion($encargado->cedula, ['nombre' => 'Agrupación 1']));
        Agrupacion::create($this->baseAgrupacion($encargado->cedula, ['nombre' => 'Agrupación 2']));
        Agrupacion::create($this->baseAgrupacion($otro->cedula, ['nombre' => 'Agrupación X']));

        $response = $this->getJson("/api/encargados/{$encargado->cedula}/agrupaciones");

        $response->assertOk();
        $this->assertCount(2, $response->json('data'));
    }

    public function test_si_falla_la_validacion_de_la_agrupacion_no_se_guarda_el_encargado(): void
    {
        $response = $this->postJson('/api/solicitudes-agrupaciones/nueva', $this->baseSolicitudCompleta([
            'agrupacion' => ['cantidad_integrantes' => 0],
        ]));

        $response->assertStatus(422);
        $this->assertDatabaseMissing('encargado', ['cedula' => '123456789']);
    }

    public function test_si_falla_la_solicitud_se_reviertan_encargado_y_agrupacion(): void
    {
        Estado::where('nom_estado', 'pendiente')->delete();

        $response = $this->postJson('/api/solicitudes-agrupaciones/nueva', $this->baseSolicitudCompleta());

        $response->assertNotFound();
        $this->assertDatabaseMissing('encargado', ['cedula' => '123456789']);
        $this->assertDatabaseCount('agrupacion', 0);
        $this->assertDatabaseCount('solicitud_agrupacion', 0);
    }

    public function test_encargado_existente_con_agrupacion_nueva_revierte_la_agrupacion_si_falla_la_solicitud(): void
    {
        Estado::where('nom_estado', 'pendiente')->delete();
        $encargado = Encargado::create($this->baseEncargado());

        $response = $this->postJson('/api/solicitudes-agrupaciones/encargado-existente', [
            'cedula' => $encargado->cedula,
            'agrupacion' => $this->baseAgrupacion($encargado->cedula),
            'solicitud' => [
                'fecha_solicitada' => '2026-09-20',
                'hora_solicitada' => '10:30',
            ],
        ]);

        $response->assertNotFound();
        $this->assertDatabaseHas('encargado', ['cedula' => $encargado->cedula]);
        $this->assertDatabaseCount('agrupacion', 0);
        $this->assertDatabaseCount('solicitud_agrupacion', 0);
    }

    public function test_una_solicitud_nueva_guarda_fecha_y_hora_solicitadas(): void
    {
        $this->crearEstadoPendiente();

        $response = $this->postJson('/api/solicitudes-agrupaciones/nueva', $this->baseSolicitudCompleta());

        $response->assertCreated();
        $this->assertDatabaseHas('solicitud_agrupacion', [
            'fecha_solicitada' => '2026-09-20',
            'hora_solicitada' => '10:30:00',
            'fecha_asignada' => null,
            'hora_asignada' => null,
        ]);
    }

    public function test_aprobar_una_solicitud_guarda_fecha_y_hora_asignadas(): void
    {
        $this->crearEstadoPendiente();
        $encargado = Encargado::create($this->baseEncargado());
        $agrupacion = Agrupacion::create($this->baseAgrupacion($encargado->cedula));
        $solicitud = SolicitudAgrupacion::create([
            'id_agrupacion' => $agrupacion->id,
            'fecha_solicitud' => now(),
            'fecha_solicitada' => '2026-09-20',
            'hora_solicitada' => '10:30',
            'id_estado' => Estado::where('nom_estado', 'pendiente')->value('id'),
        ]);

        $this->patchJson("/api/solicitudes-agrupaciones/{$solicitud->id}/aprobar", [
            'fecha_asignada' => '2026-09-21',
            'hora_asignada' => '11:00',
        ])->assertOk();

        $this->assertDatabaseHas('solicitud_agrupacion', [
            'id' => $solicitud->id,
            'fecha_solicitada' => '2026-09-20',
            'hora_solicitada' => '10:30:00',
            'fecha_asignada' => '2026-09-21',
            'hora_asignada' => '11:00:00',
        ]);
    }

    public function test_archivo_adjunto_es_obligatorio_en_una_solicitud_nueva(): void
    {
        $payload = $this->baseSolicitudCompleta();
        unset($payload['agrupacion']['archivo_adjunto']);

        $this->postJson('/api/solicitudes-agrupaciones/nueva', $payload)
            ->assertStatus(422)
            ->assertJsonValidationErrors('agrupacion.archivo_adjunto');

        $this->assertDatabaseMissing('encargado', ['cedula' => '123456789']);
    }
}
