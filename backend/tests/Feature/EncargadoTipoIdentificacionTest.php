<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EncargadoTipoIdentificacionTest extends TestCase
{
    use RefreshDatabase;

    private function datosBase(array $overrides = []): array
    {
        return array_merge([
            'cedula' => '123456789',
            'tipo_identificacion' => 'cedula',
            'primer_nombre' => 'Juan',
            'apellido' => 'García',
            'email' => 'juan.garcia@example.com',
            'numero_tel' => '12345678',
        ], $overrides);
    }

    public function test_crea_encargado_con_cedula_valida(): void
    {
        $response = $this->postJson('/api/encargados', $this->datosBase());

        $response->assertCreated();
        $response->assertJsonPath('data.tipo_identificacion', 'cedula');
        $this->assertDatabaseHas('encargado', [
            'cedula' => '123456789',
            'tipo_identificacion' => 'cedula',
        ]);
    }

    public function test_crea_encargado_con_dimex_de_11_digitos(): void
    {
        $response = $this->postJson('/api/encargados', $this->datosBase([
            'cedula' => '12345678901',
            'tipo_identificacion' => 'dimex',
            'email' => 'dimex11@example.com',
        ]));

        $response->assertCreated();
    }

    public function test_crea_encargado_con_dimex_de_12_digitos(): void
    {
        $response = $this->postJson('/api/encargados', $this->datosBase([
            'cedula' => '123456789012',
            'tipo_identificacion' => 'dimex',
            'email' => 'dimex12@example.com',
        ]));

        $response->assertCreated();
    }

    public function test_crea_encargado_con_pasaporte_alfanumerico(): void
    {
        $response = $this->postJson('/api/encargados', $this->datosBase([
            'cedula' => 'A1234567',
            'tipo_identificacion' => 'pasaporte',
            'email' => 'pasaporte@example.com',
        ]));

        $response->assertCreated();
    }

    public function test_rechaza_tipo_identificacion_faltante(): void
    {
        $datos = $this->datosBase();
        unset($datos['tipo_identificacion']);

        $response = $this->postJson('/api/encargados', $datos);

        $response->assertJsonValidationErrors(['tipo_identificacion']);
    }

    public function test_rechaza_tipo_identificacion_invalido(): void
    {
        $response = $this->postJson('/api/encargados', $this->datosBase([
            'tipo_identificacion' => 'licencia',
        ]));

        $response->assertJsonValidationErrors(['tipo_identificacion']);
    }

    public function test_rechaza_dimex_con_formato_de_cedula(): void
    {
        $response = $this->postJson('/api/encargados', $this->datosBase([
            'cedula' => '123456789',
            'tipo_identificacion' => 'dimex',
        ]));

        $response->assertJsonValidationErrors(['cedula']);
    }

    public function test_rechaza_pasaporte_demasiado_corto(): void
    {
        $response = $this->postJson('/api/encargados', $this->datosBase([
            'cedula' => 'A1234',
            'tipo_identificacion' => 'pasaporte',
        ]));

        $response->assertJsonValidationErrors(['cedula']);
    }
}
