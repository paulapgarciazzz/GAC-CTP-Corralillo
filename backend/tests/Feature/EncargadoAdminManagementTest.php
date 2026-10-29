<?php

namespace Tests\Feature;

use App\Modules\SolicitudesAgrupaciones\Models\Agrupacion;
use App\Modules\SolicitudesAgrupaciones\Models\Auditoria;
use App\Modules\SolicitudesAgrupaciones\Models\Encargado;
use App\Modules\SolicitudesAgrupaciones\Models\Estado;
use App\Modules\SolicitudesAgrupaciones\Models\Participacion;
use App\Modules\SolicitudesAgrupaciones\Models\SolicitudAgrupacion;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\ActuaComoAdmin;
use Tests\TestCase;

class EncargadoAdminManagementTest extends TestCase
{
    use ActuaComoAdmin;
    use RefreshDatabase;

    private const PNG_1X1 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

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
            'cantidad_integrantes' => 10,
            'resena' => 'Reseña base',
            'archivo_adjunto' => 'data:image/png;base64,' . self::PNG_1X1,
        ], $overrides);
    }

    protected function setUp(): void
    {
        parent::setUp();

        $this->actuarComoAdmin();
    }

    private function crearSolicitud(string $cedula, string $estado, array $agrupacion = []): SolicitudAgrupacion
    {
        $agrupacion = Agrupacion::create($this->baseAgrupacion($cedula, $agrupacion));

        return SolicitudAgrupacion::create([
            'id_agrupacion' => $agrupacion->id,
            'fecha_solicitud' => now(),
            'id_estado' => Estado::where('nom_estado', $estado)->first()->id,
            'comentarios' => 'solicitud de prueba',
        ]);
    }

    public function test_get_encargados_devuelve_listado_administrativo(): void
    {
        Encargado::create($this->baseEncargado());
        Encargado::create($this->baseEncargado([
            'cedula' => '987654321',
            'email' => 'otro@example.com',
            'numero_tel' => '77778888',
        ]));
        $this->crearSolicitud('123456789', 'aprobada');
        $this->crearSolicitud('987654321', 'aprobada', ['nombre' => 'Agrupación B']);

        $response = $this->getJson('/api/encargados');

        $response->assertOk();
        $this->assertCount(2, $response->json('data'));
    }

    public function test_get_encargados_excluye_encargados_sin_solicitud_aprobada(): void
    {
        Encargado::create($this->baseEncargado());
        Encargado::create($this->baseEncargado([
            'cedula' => '987654321',
            'email' => 'otro@example.com',
            'numero_tel' => '77778888',
        ]));
        Encargado::create($this->baseEncargado([
            'cedula' => '111222333',
            'email' => 'tercero@example.com',
            'numero_tel' => '66667777',
        ]));
        $this->crearSolicitud('123456789', 'aprobada');
        $this->crearSolicitud('987654321', 'pendiente', ['nombre' => 'Agrupación B']);
        $this->crearSolicitud('111222333', 'rechazada', ['nombre' => 'Agrupación C']);

        $response = $this->getJson('/api/encargados');

        $response->assertOk();
        $this->assertSame(['123456789'], array_column($response->json('data'), 'cedula'));
    }

    public function test_get_encargados_incluye_agrupaciones_count_y_solicitudes_count(): void
    {
        $encargado = Encargado::create($this->baseEncargado());
        $solicitud = $this->crearSolicitud($encargado->cedula, 'aprobada');
        $this->crearSolicitud($encargado->cedula, 'pendiente', ['nombre' => 'Agrupación B']);

        $response = $this->getJson('/api/encargados');

        $response->assertOk();
        $response->assertJsonPath('data.0.agrupaciones_count', 2);
        $response->assertJsonPath('data.0.solicitudes_count', 2);

        $solicitud->auditorias()->forceCreate([
            'id_solicitud' => $solicitud->id,
            'accion' => 'creada',
            'fecha_accion' => now(),
        ]);
    }

    public function test_se_puede_eliminar_encargado_sin_agrupaciones(): void
    {
        $encargado = Encargado::create($this->baseEncargado());

        $response = $this->deleteJson("/api/encargados/{$encargado->cedula}");

        $response->assertNoContent();
        $this->assertDatabaseMissing('encargado', ['cedula' => $encargado->cedula]);
    }

    public function test_se_puede_eliminar_encargado_con_agrupaciones(): void
    {
        $encargado = Encargado::create($this->baseEncargado());
        $agrupacion = Agrupacion::create($this->baseAgrupacion($encargado->cedula));
        $solicitud = SolicitudAgrupacion::create([
            'id_agrupacion' => $agrupacion->id,
            'fecha_solicitud' => now(),
            'id_estado' => Estado::where('nom_estado', 'pendiente')->first()->id,
            'comentarios' => 'solicitud de prueba',
        ]);
        $solicitud->auditorias()->forceCreate([
            'id_solicitud' => $solicitud->id,
            'accion' => 'creada',
            'fecha_accion' => now(),
        ]);
        $agrupacion->participaciones()->create([
            'lugar' => 'Heredia',
            'fecha' => '2026-08-10',
        ]);

        $response = $this->deleteJson("/api/encargados/{$encargado->cedula}");

        $response->assertNoContent();
        $this->assertDatabaseMissing('encargado', ['cedula' => $encargado->cedula]);
        $this->assertDatabaseMissing('agrupacion', ['id' => $agrupacion->id]);
        $this->assertDatabaseMissing('solicitud_agrupacion', ['id' => $solicitud->id]);
        $this->assertDatabaseMissing('auditoria', ['id_solicitud' => $solicitud->id]);
        $this->assertDatabaseMissing('participacion', ['id_agrupacion' => $agrupacion->id]);
    }

    public function test_no_se_eliminan_otros_encargados_ni_sus_datos(): void
    {
        $encargadoA = Encargado::create($this->baseEncargado());
        $encargadoB = Encargado::create($this->baseEncargado([
            'cedula' => '987654321',
            'email' => 'otro@example.com',
            'numero_tel' => '77778888',
        ]));
        $agrupacionB = Agrupacion::create($this->baseAgrupacion($encargadoB->cedula, ['nombre' => 'Agrupación B']));

        $this->deleteJson("/api/encargados/{$encargadoA->cedula}");

        $this->assertDatabaseMissing('encargado', ['cedula' => $encargadoA->cedula]);
        $this->assertDatabaseHas('encargado', ['cedula' => $encargadoB->cedula]);
        $this->assertDatabaseHas('agrupacion', ['id' => $agrupacionB->id]);
    }

    public function test_delete_inexistente_devuelve_404(): void
    {
        $response = $this->deleteJson('/api/encargados/999999999');

        $response->assertNotFound();
    }

    public function test_no_se_puede_crear_encargado_con_cedula_existente(): void
    {
        Encargado::create($this->baseEncargado());

        $response = $this->postJson('/api/encargados', $this->baseEncargado([
            'email' => 'otro@example.com',
            'numero_tel' => '12345678',
        ]));

        $response->assertStatus(422)
            ->assertJsonPath('errors.cedula.0', 'Esta cédula ya está registrada. Si ya ha participado anteriormente, seleccione la opción \'Sí, ya he participado\'.');
        $this->assertEquals(1, Encargado::where('cedula', '123456789')->count());
    }

    public function test_no_se_puede_crear_encargado_con_email_existente(): void
    {
        Encargado::create($this->baseEncargado());

        $response = $this->postJson('/api/encargados', $this->baseEncargado([
            'cedula' => '987654321',
            'numero_tel' => '12345678',
            'email' => 'juan.garcia@example.com',
        ]));

        $response->assertStatus(422)
            ->assertJsonPath('errors.email.0', 'Este correo electrónico ya está registrado.');
    }

    public function test_no_se_puede_crear_encargado_con_telefono_existente(): void
    {
        Encargado::create($this->baseEncargado());

        $response = $this->postJson('/api/encargados', $this->baseEncargado([
            'cedula' => '987654321',
            'email' => 'otro@example.com',
            'numero_tel' => '88889999',
        ]));

        $response->assertStatus(422)
            ->assertJsonPath('errors.numero_tel.0', 'Este número de teléfono ya está registrado.');
    }
}
