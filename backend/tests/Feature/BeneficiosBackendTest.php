<?php

namespace Tests\Feature;

use App\Modules\Beneficios\Models\Alimentacion;
use App\Modules\Beneficios\Models\Aula;
use App\Modules\Beneficios\Models\Mobiliario;
use App\Modules\Beneficios\Models\Ruta;
use App\Modules\Beneficios\Models\Tarima;
use App\Modules\Beneficios\Models\Transporte;
use App\Modules\SolicitudesAgrupaciones\Models\Agrupacion;
use App\Modules\SolicitudesAgrupaciones\Models\Encargado;
use App\Modules\SolicitudesAgrupaciones\Models\Estado;
use App\Modules\SolicitudesAgrupaciones\Models\SolicitudAgrupacion;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BeneficiosBackendTest extends TestCase
{
    use RefreshDatabase;

    private Agrupacion $agrupacion;
    private Alimentacion $alimentacion;
    private Mobiliario $mobiliario;
    private Aula $aula;
    private Tarima $tarima;
    private Ruta $ruta;
    private Transporte $transporte;

    protected function setUp(): void
    {
        parent::setUp();

        $encargado = Encargado::create([
            'cedula' => '123456789',
            'tipo_identificacion' => 'cedula',
            'primer_nombre' => 'Usuario',
            'apellido' => 'Prueba',
            'email' => 'beneficios@test.com',
            'numero_tel' => '88880000',
        ]);

        $this->agrupacion = Agrupacion::create([
            'ced_encargado' => $encargado->cedula,
            'nombre' => 'Agrupacion de Prueba',
            'lugar_procedencia' => 'Guanacaste',
            'cantidad_integrantes' => 20,
        ]);

        $this->alimentacion = Alimentacion::create([
            'tiempo_comida' => 'Almuerzo',
        ]);

        $this->mobiliario = Mobiliario::create([
            'nombre' => 'Sillas',
        ]);

        $this->aula = Aula::create([
            'nombre' => 'Aula Principal',
            'capacidad' => 50,
        ]);

        $this->tarima = Tarima::create([
            'nombre' => 'Tarima Principal',
        ]);

        $this->ruta = Ruta::create([
            'nombre_ruta' => 'Ruta Santa Cruz',
        ]);

        $this->transporte = Transporte::create([
            'matricula' => 'BUS001',
            'tipo' => 'Bus',
            'capacidad' => 40,
            'cedula_conductor' => '1234567890',
            'nombre_conductor' => 'Carlos',
            'apellido_conductor' => 'Mora',
        ]);
    }

    public function test_lista_catalogos_de_beneficios(): void
    {
        $this->getJson('/api/alimentaciones')
            ->assertOk()
            ->assertJsonPath(
                'data.0.tiempo_comida',
                'Almuerzo'
            );

        $this->getJson('/api/aulas')
            ->assertOk()
            ->assertJsonPath(
                'data.0.nombre',
                'Aula Principal'
            );

        $this->getJson('/api/mobiliarios')
            ->assertOk()
            ->assertJsonPath(
                'data.0.nombre',
                'Sillas'
            );

        $this->getJson('/api/rutas')
            ->assertOk()
            ->assertJsonPath(
                'data.0.nombre_ruta',
                'Ruta Santa Cruz'
            );

        $this->getJson('/api/tarimas')
            ->assertOk()
            ->assertJsonPath(
                'data.0.nombre',
                'Tarima Principal'
            );

        $this->getJson('/api/transportes')
            ->assertOk()
            ->assertJsonPath(
                'data.0.matricula',
                'BUS001'
            );
    }

    public function test_crea_asignacion_para_solicitud_aprobada_con_varios_beneficios_del_mismo_tipo(): void
    {
        $estadoAprobada = Estado::where('nom_estado', 'aprobada')->firstOrFail();

        $solicitud = SolicitudAgrupacion::create([
            'id_agrupacion' => $this->agrupacion->id,
            'ced_encargado' => '123456789',
            'fecha_solicitud' => now(),
            'id_estado' => $estadoAprobada->id,
        ]);

        $response = $this->postJson(
            '/api/asignaciones-beneficios',
            [
                'id_solicitud_agrupacion' => $solicitud->id,
                'observaciones' => 'Asignación revisada',
                'mobiliarios' => [
                    ['id_mobiliario' => $this->mobiliario->id_mobiliario, 'cantidad' => 20],
                    ['id_mobiliario' => $this->mobiliario->id_mobiliario, 'cantidad' => 5],
                ],
                'alimentaciones' => [
                    ['id_alimentacion' => $this->alimentacion->id_alimentacion, 'cantidad' => 30],
                    ['id_alimentacion' => $this->alimentacion->id_alimentacion, 'cantidad' => 30],
                ],
                'aulas' => [
                    ['id_aula' => $this->aula->id_aula],
                ],
                'tarimas' => [
                    ['id_tarima' => $this->tarima->id_tarima],
                ],
                'transportes' => [
                    ['matricula' => $this->transporte->matricula, 'id_ruta' => $this->ruta->id_ruta],
                ],
            ]
        );

        $response->assertCreated()
            ->assertJsonPath('data.id_solicitud_agrupacion', $solicitud->id)
            ->assertJsonPath('data.observaciones', 'Asignación revisada')
            ->assertJsonPath('data.mobiliarios.0.cantidad', 20)
            ->assertJsonPath('data.mobiliarios.1.cantidad', 5)
            ->assertJsonPath('data.alimentaciones.1.cantidad', 30);

        $this->assertDatabaseHas('asignacion_beneficios', [
            'id_solicitud_agrupacion' => $solicitud->id,
            'observaciones' => 'Asignación revisada',
        ]);

        $this->assertDatabaseCount('asignacion_mobiliario', 2);
        $this->assertDatabaseCount('asignacion_alimentacion', 2);
    }

    public function test_rechaza_asignacion_para_solicitud_inexistente(): void
    {
        $response = $this->postJson(
            '/api/asignaciones-beneficios',
            [
                'id_solicitud_agrupacion' => 999999,
                'mobiliarios' => [
                    ['id_mobiliario' => $this->mobiliario->id_mobiliario, 'cantidad' => 10],
                ],
            ]
        );

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['id_solicitud_agrupacion']);

        $this->assertDatabaseCount('asignacion_beneficios', 0);
    }

    public function test_rechaza_asignacion_si_la_solicitud_no_esta_aprobada(): void
    {
        $estadoPendiente = Estado::where('nom_estado', 'pendiente')->firstOrFail();

        $solicitud = SolicitudAgrupacion::create([
            'id_agrupacion' => $this->agrupacion->id,
            'ced_encargado' => '123456789',
            'fecha_solicitud' => now(),
            'id_estado' => $estadoPendiente->id,
        ]);

        $response = $this->postJson(
            '/api/asignaciones-beneficios',
            [
                'id_solicitud_agrupacion' => $solicitud->id,
                'mobiliarios' => [
                    ['id_mobiliario' => $this->mobiliario->id_mobiliario, 'cantidad' => 10],
                ],
            ]
        );

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['id_solicitud_agrupacion']);
    }

    public function test_no_acepta_campos_legacy_del_contrato_anterior(): void
    {
        $estadoAprobada = Estado::where('nom_estado', 'aprobada')->firstOrFail();

        $solicitud = SolicitudAgrupacion::create([
            'id_agrupacion' => $this->agrupacion->id,
            'ced_encargado' => '123456789',
            'fecha_solicitud' => now(),
            'id_estado' => $estadoAprobada->id,
        ]);

        $response = $this->postJson(
            '/api/asignaciones-beneficios',
            [
                'id_solicitud_agrupacion' => $solicitud->id,
                'id_agrupacion' => $this->agrupacion->id,
                'fecha_solicitud' => '2026-09-11',
                'id_solicitud_mobiliario' => 99,
                'id_solicitud_alimentacion' => 99,
                'id_solicitud_transporte' => 99,
                'id_tarima' => $this->tarima->id_tarima,
                'id_aula' => $this->aula->id_aula,
                'mobiliarios' => [
                    ['id_mobiliario' => $this->mobiliario->id_mobiliario, 'cantidad' => 10],
                ],
            ]
        );

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'id_agrupacion',
                'fecha_solicitud',
                'id_solicitud_mobiliario',
                'id_solicitud_alimentacion',
                'id_solicitud_transporte',
                'id_tarima',
                'id_aula',
            ]);
    }

    public function test_no_permite_mas_de_una_cabecera_por_solicitud(): void
    {
        $estadoAprobada = Estado::where('nom_estado', 'aprobada')->firstOrFail();

        $solicitud = SolicitudAgrupacion::create([
            'id_agrupacion' => $this->agrupacion->id,
            'ced_encargado' => '123456789',
            'fecha_solicitud' => now(),
            'id_estado' => $estadoAprobada->id,
        ]);

        $this->postJson('/api/asignaciones-beneficios', [
            'id_solicitud_agrupacion' => $solicitud->id,
            'mobiliarios' => [
                ['id_mobiliario' => $this->mobiliario->id_mobiliario, 'cantidad' => 10],
            ],
        ]);

        $response = $this->postJson('/api/asignaciones-beneficios', [
            'id_solicitud_agrupacion' => $solicitud->id,
            'mobiliarios' => [
                ['id_mobiliario' => $this->mobiliario->id_mobiliario, 'cantidad' => 5],
            ],
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['id_solicitud_agrupacion']);
    }

    public function test_arrays_vacios_eliminan_detalles(): void
    {
        $estadoAprobada = Estado::where('nom_estado', 'aprobada')->firstOrFail();

        $solicitud = SolicitudAgrupacion::create([
            'id_agrupacion' => $this->agrupacion->id,
            'ced_encargado' => '123456789',
            'fecha_solicitud' => now(),
            'id_estado' => $estadoAprobada->id,
        ]);

        $crear = $this->postJson('/api/asignaciones-beneficios', [
            'id_solicitud_agrupacion' => $solicitud->id,
            'observaciones' => 'Inicial',
            'mobiliarios' => [
                ['id_mobiliario' => $this->mobiliario->id_mobiliario, 'cantidad' => 20],
            ],
            'alimentaciones' => [
                ['id_alimentacion' => $this->alimentacion->id_alimentacion, 'cantidad' => 15],
            ],
        ]);

        $crear->assertCreated();

        $idAsignacion = $crear->json('data.id');

        $response = $this->patchJson(
            "/api/asignaciones-beneficios/{$idAsignacion}",
            [
                'mobiliarios' => [],
                'alimentaciones' => [],
            ]
        );

        $response->assertOk();
        $this->assertDatabaseCount('asignacion_mobiliario', 0);
        $this->assertDatabaseCount('asignacion_alimentacion', 0);
    }

    public function test_actualiza_asignacion_de_beneficios(): void
    {
        $estadoAprobada = Estado::where('nom_estado', 'aprobada')->firstOrFail();

        $solicitud = SolicitudAgrupacion::create([
            'id_agrupacion' => $this->agrupacion->id,
            'ced_encargado' => '123456789',
            'fecha_solicitud' => now(),
            'id_estado' => $estadoAprobada->id,
        ]);

        $crear = $this->postJson(
            '/api/asignaciones-beneficios',
            [
                'id_solicitud_agrupacion' => $solicitud->id,
                'observaciones' => 'Inicial',
                'mobiliarios' => [
                    ['id_mobiliario' => $this->mobiliario->id_mobiliario, 'cantidad' => 20],
                ],
                'alimentaciones' => [
                    ['id_alimentacion' => $this->alimentacion->id_alimentacion, 'cantidad' => 15],
                ],
                'aulas' => [
                    ['id_aula' => $this->aula->id_aula],
                ],
                'tarimas' => [
                    ['id_tarima' => $this->tarima->id_tarima],
                ],
                'transportes' => [
                    ['matricula' => $this->transporte->matricula, 'id_ruta' => $this->ruta->id_ruta],
                ],
            ]
        );

        $crear->assertCreated();

        $idAsignacion = $crear->json('data.id');

        $response = $this->patchJson(
            "/api/asignaciones-beneficios/{$idAsignacion}",
            [
                'observaciones' => 'Actualizada',
                'mobiliarios' => [
                    ['id_mobiliario' => $this->mobiliario->id_mobiliario, 'cantidad' => 30],
                ],
            ]
        );

        $response->assertOk()
            ->assertJsonPath('data.id', $idAsignacion)
            ->assertJsonPath('data.observaciones', 'Actualizada')
            ->assertJsonPath('data.mobiliarios.0.cantidad', 30);

        $this->assertDatabaseHas('asignacion_beneficios', [
            'id' => $idAsignacion,
            'observaciones' => 'Actualizada',
        ]);

        $this->assertDatabaseHas('asignacion_mobiliario', [
            'id_asignacion_beneficios' => $idAsignacion,
            'cantidad' => 30,
        ]);
    }
}