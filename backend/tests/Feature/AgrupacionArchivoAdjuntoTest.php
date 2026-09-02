<?php

namespace Tests\Feature;

use App\Modules\SolicitudesAgrupaciones\Models\Encargado;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AgrupacionArchivoAdjuntoTest extends TestCase
{
    use RefreshDatabase;

    private const PNG_1X1 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

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
    }

    private function datosBase(array $overrides = []): array
    {
        return array_merge([
            'ced_encargado' => $this->encargado->cedula,
            'nombre' => 'Agrupacion de prueba',
            'lugar_procedencia' => 'Guanacaste',
            'cantidad_integrantes' => 10,
            'archivo_adjunto' => 'data:image/png;base64,' . self::PNG_1X1,
        ], $overrides);
    }

    public function test_creacion_requiere_archivo_adjunto(): void
    {
        $datos = $this->datosBase();
        unset($datos['archivo_adjunto']);

        $response = $this->postJson('/api/agrupaciones', $datos);

        $response->assertJsonValidationErrors(['archivo_adjunto']);
    }

    public function test_creacion_rechaza_tipo_no_permitido(): void
    {
        $response = $this->postJson('/api/agrupaciones', $this->datosBase([
            'archivo_adjunto' => 'data:text/plain;base64,' . base64_encode('hola'),
        ]));

        $response->assertJsonValidationErrors(['archivo_adjunto']);
    }

    public function test_creacion_rechaza_archivo_que_excede_tamano_maximo(): void
    {
        $contenidoGrande = "\x89PNG\r\n\x1a\n" . str_repeat('a', 5 * 1024 * 1024);

        $response = $this->postJson('/api/agrupaciones', $this->datosBase([
            'archivo_adjunto' => 'data:image/png;base64,' . base64_encode($contenidoGrande),
        ]));

        $response->assertJsonValidationErrors(['archivo_adjunto']);
    }

    public function test_creacion_acepta_archivo_valido_y_lo_persiste(): void
    {
        $response = $this->postJson('/api/agrupaciones', $this->datosBase());

        $response->assertCreated();
        $this->assertDatabaseHas('agrupacion', [
            'nombre' => 'Agrupacion de prueba',
        ]);
    }

    public function test_resource_expone_url_calculada_no_base64_crudo(): void
    {
        $response = $this->postJson('/api/agrupaciones', $this->datosBase());

        $response->assertCreated();
        $response->assertJsonPath('data.archivo_adjunto_url', fn ($valor) => is_string($valor) && str_contains($valor, '/archivo-adjunto'));
        $response->assertJsonMissingPath('data.archivo_adjunto');
    }

    public function test_endpoint_archivo_adjunto_devuelve_binario_con_content_type_correcto(): void
    {
        $creacion = $this->postJson('/api/agrupaciones', $this->datosBase());
        $id = $creacion->json('data.id');

        $response = $this->get("/api/agrupaciones/{$id}/archivo-adjunto");

        $response->assertOk();
        $response->assertHeader('Content-Type', 'image/png');
        $this->assertEquals(base64_decode(self::PNG_1X1), $response->getContent());
    }

    public function test_endpoint_archivo_adjunto_devuelve_404_si_no_existe(): void
    {
        $creacion = $this->postJson('/api/agrupaciones', $this->datosBase());
        $id = $creacion->json('data.id');

        \App\Modules\SolicitudesAgrupaciones\Models\Agrupacion::where('id', $id)->update(['archivo_adjunto' => null]);

        $response = $this->get("/api/agrupaciones/{$id}/archivo-adjunto");

        $response->assertNotFound();
    }
}
