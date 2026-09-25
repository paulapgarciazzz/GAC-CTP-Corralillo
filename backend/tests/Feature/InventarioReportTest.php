<?php

namespace Tests\Feature;

use App\Modules\Beneficios\Models\Alimentacion;
use App\Modules\Beneficios\Models\Aula;
use App\Modules\Beneficios\Models\Mobiliario;
use App\Modules\Beneficios\Models\Transporte;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InventarioReportTest extends TestCase
{
    use RefreshDatabase;

    public function test_reporte_vacio_devuelve_los_cuatro_tipos_en_cero(): void
    {
        $this->getJson('/api/reportes/inventario')
            ->assertOk()
            ->assertJsonPath('data.total_items', 0)
            ->assertJsonPath('data.mobiliario_unidades', 0)
            ->assertJsonCount(4, 'data.por_tipo')
            ->assertJsonPath('data.por_tipo.0.tipo', 'alimentacion')
            ->assertJsonPath('data.por_tipo.0.total', 0)
            ->assertJsonPath('data.por_tipo.3.tipo', 'transporte')
            ->assertJsonPath('data.por_tipo.3.total', 0);
    }

    public function test_cuenta_los_items_ingresados_por_tipo_de_beneficio(): void
    {
        Alimentacion::create(['tiempo_comida' => 'Desayuno']);
        Alimentacion::create(['tiempo_comida' => 'Almuerzo']);
        Mobiliario::create(['nombre' => 'Sillas', 'cantidad_disponible' => 30]);
        Mobiliario::create(['nombre' => 'Mesas', 'cantidad_disponible' => 12]);
        Mobiliario::create(['nombre' => 'Toldos']);
        Aula::create(['nombre' => 'Aula 1', 'capacidad' => 30]);
        Transporte::create([
            'matricula' => 'BUS001',
            'tipo' => 'Bus',
            'capacidad' => 40,
            'cedula_conductor' => '1111111111',
            'nombre_conductor' => 'Carlos',
            'apellido_conductor' => 'Mora',
        ]);

        $this->getJson('/api/reportes/inventario')
            ->assertOk()
            ->assertJsonPath('data.total_items', 7)
            ->assertJsonPath('data.mobiliario_unidades', 42)
            ->assertJsonPath('data.por_tipo.0.total', 2)
            ->assertJsonPath('data.por_tipo.1.total', 3)
            ->assertJsonPath('data.por_tipo.2.total', 1)
            ->assertJsonPath('data.por_tipo.3.total', 1);
    }
}
