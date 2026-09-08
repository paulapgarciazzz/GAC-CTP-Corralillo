<?php

namespace Tests\Feature;

use App\Modules\SolicitudesAgrupaciones\Models\Agrupacion;
use App\Modules\SolicitudesAgrupaciones\Models\Auditoria;
use App\Modules\SolicitudesAgrupaciones\Models\Encargado;
use App\Modules\SolicitudesAgrupaciones\Models\Estado;
use App\Modules\SolicitudesAgrupaciones\Models\Participacion;
use App\Modules\SolicitudesAgrupaciones\Models\SolicitudAgrupacion;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AgrupacionAdminManagementTest extends TestCase
{
    use RefreshDatabase;

    private Encargado $encargado;

    protected function setUp(): void
    {
        parent::setUp();

        $this->encargado = Encargado::create([
            'cedula' => '123456789',
            'tipo_identificacion' => 'cedula',
            'primer_nombre' => 'Juan',
            'apellido' => 'García',
            'email' => 'juan.garcia@example.com',
            'numero_tel' => '88887777',
        ]);

        Estado::forceCreate(['nom_estado' => 'pendiente']);
        Estado::forceCreate(['nom_estado' => 'aprobada']);
        Estado::forceCreate(['nom_estado' => 'rechazada']);
    }

    private function datosAgrupacion(string $nombre, array $overrides = []): array
    {
        return array_merge([
            'ced_encargado' => $this->encargado->cedula,
            'nombre' => $nombre,
            'lugar_procedencia' => 'San José',
            'cantidad_integrantes' => 10,
            'resena' => 'Reseña base',
            'archivo_adjunto' => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
        ], $overrides);
    }

    public function test_get_agrupaciones_devuelve_listado_administrativo(): void
    {
        Agrupacion::create($this->datosAgrupacion('Agrupación A'));
        Agrupacion::create($this->datosAgrupacion('Agrupación B'));

        $response = $this->getJson('/api/agrupaciones');

        $response->assertOk();
        $this->assertCount(2, $response->json('data'));
    }

    public function test_get_agrupaciones_incluye_solicitudes_count(): void
    {
        $agrupacion = Agrupacion::create($this->datosAgrupacion('Agrupación con solicitud'));
        SolicitudAgrupacion::create([
            'id_agrupacion' => $agrupacion->id,
            'fecha_solicitud' => now(),
            'id_estado' => Estado::where('nom_estado', 'pendiente')->first()->id,
            'comentarios' => 'Primera',
        ]);

        $response = $this->getJson('/api/agrupaciones');

        $response->assertOk();
        $response->assertJsonPath('data.0.solicitudes_count', 1);
    }

    public function test_se_puede_eliminar_agrupacion_sin_solicitudes(): void
    {
        $agrupacion = Agrupacion::create($this->datosAgrupacion('Agrupación sin solicitudes'));

        $response = $this->deleteJson("/api/agrupaciones/{$agrupacion->id}");

        $response->assertNoContent();
        $this->assertDatabaseMissing('agrupacion', ['id' => $agrupacion->id]);
        $this->assertDatabaseHas('encargado', ['cedula' => $this->encargado->cedula]);
    }

    public function test_se_puede_eliminar_agrupacion_con_solicitudes(): void
    {
        $agrupacion = Agrupacion::create($this->datosAgrupacion('Agrupación con solicitudes'));
        $solicitud = SolicitudAgrupacion::create([
            'id_agrupacion' => $agrupacion->id,
            'fecha_solicitud' => now(),
            'id_estado' => Estado::where('nom_estado', 'pendiente')->first()->id,
            'comentarios' => 'Solicitada',
        ]);
        Auditoria::forceCreate([
            'id_solicitud' => $solicitud->id,
            'accion' => 'creada',
            'fecha_accion' => now(),
        ]);
        $agrupacion->participaciones()->create([
            'lugar' => 'Heredia',
            'fecha' => '2026-08-10',
        ]);

        $response = $this->deleteJson("/api/agrupaciones/{$agrupacion->id}");

        $response->assertNoContent();
        $this->assertDatabaseMissing('agrupacion', ['id' => $agrupacion->id]);
        $this->assertDatabaseMissing('solicitud_agrupacion', ['id' => $solicitud->id]);
        $this->assertDatabaseMissing('auditoria', ['id_solicitud' => $solicitud->id]);
        $this->assertDatabaseMissing('participacion', ['id_agrupacion' => $agrupacion->id]);
        $this->assertDatabaseHas('encargado', ['cedula' => $this->encargado->cedula]);
    }

    public function test_no_se_elimina_otra_agrupacion_del_mismo_encargado(): void
    {
        $agrupacionA = Agrupacion::create($this->datosAgrupacion('Agrupación A'));
        $agrupacionB = Agrupacion::create($this->datosAgrupacion('Agrupación B'));

        $this->deleteJson("/api/agrupaciones/{$agrupacionA->id}");

        $this->assertDatabaseMissing('agrupacion', ['id' => $agrupacionA->id]);
        $this->assertDatabaseHas('agrupacion', ['id' => $agrupacionB->id]);
    }

    public function test_delete_inexistente_devuelve_404(): void
    {
        $response = $this->deleteJson('/api/agrupaciones/999999');

        $response->assertNotFound();
    }
}
