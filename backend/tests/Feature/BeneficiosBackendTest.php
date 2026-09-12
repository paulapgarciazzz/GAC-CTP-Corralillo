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

    public function test_crea_asignacion_completa_de_beneficios(): void
    {
        $response = $this->postJson(
            '/api/asignaciones-beneficios',
            [
                'id_agrupacion' => $this->agrupacion->id,
                'fecha_solicitud' => '2026-09-11',

                'id_alimentacion' =>
                    $this->alimentacion->id_alimentacion,

                'mobiliario' => [
                    'id_mobiliario' =>
                        $this->mobiliario->id_mobiliario,
                    'cantidad' => 20,
                ],

                'id_tarima' =>
                    $this->tarima->id_tarima,

                'id_aula' =>
                    $this->aula->id_aula,

                'transporte' => [
                    'matricula' =>
                        $this->transporte->matricula,
                    'id_ruta' =>
                        $this->ruta->id_ruta,
                ],
            ]
        );

        $response->assertCreated()
            ->assertJsonPath(
                'data.agrupacion.id',
                $this->agrupacion->id
            )
            ->assertJsonPath(
                'data.alimentacion.alimentacion.id_alimentacion',
                $this->alimentacion->id_alimentacion
            )
            ->assertJsonPath(
                'data.mobiliario.cantidad',
                20
            )
            ->assertJsonPath(
                'data.aula.id_aula',
                $this->aula->id_aula
            )
            ->assertJsonPath(
                'data.tarima.id_tarima',
                $this->tarima->id_tarima
            )
            ->assertJsonPath(
                'data.transporte.transporte.matricula',
                'BUS001'
            )
            ->assertJsonPath(
                'data.transporte.ruta.id_ruta',
                $this->ruta->id_ruta
            );

        $this->assertDatabaseHas(
            'asignacion_beneficios',
            [
                'id_agrupacion' =>
                    $this->agrupacion->id,
                'id_tarima' =>
                    $this->tarima->id_tarima,
                'id_aula' =>
                    $this->aula->id_aula,
            ]
        );

        $this->assertDatabaseHas(
            'solicitud_alimentacion',
            [
                'id_alimentacion' =>
                    $this->alimentacion->id_alimentacion,
            ]
        );

        $this->assertDatabaseHas(
            'solicitud_mobiliario',
            [
                'cantidad' => 20,
                'id_sol_mobiliario' =>
                    $this->mobiliario->id_mobiliario,
            ]
        );

        $this->assertDatabaseHas(
            'solicitud_transporte',
            [
                'matricula' => 'BUS001',
                'id_ruta' =>
                    $this->ruta->id_ruta,
            ]
        );
    }

    public function test_rechaza_asignacion_con_datos_invalidos(): void
    {
        $response = $this->postJson(
            '/api/asignaciones-beneficios',
            [
                'fecha_solicitud' => '2026-09-11',

                'mobiliario' => [
                    'id_mobiliario' =>
                        $this->mobiliario->id_mobiliario,
                    'cantidad' => 0,
                ],
            ]
        );

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'id_agrupacion',
                'mobiliario.cantidad',
            ]);

        $this->assertDatabaseCount(
            'asignacion_beneficios',
            0
        );

        $this->assertDatabaseCount(
            'solicitud_mobiliario',
            0
        );
    }

    public function test_asignacion_inexistente_devuelve_404(): void
    {
        $this->getJson(
            '/api/asignaciones-beneficios/999999'
        )->assertNotFound();
    }

    public function test_no_acepta_ids_internos_de_solicitudes(): void
    {
        $response = $this->postJson(
            '/api/asignaciones-beneficios',
            [
                'id_agrupacion' =>
                    $this->agrupacion->id,

                'fecha_solicitud' =>
                    '2026-09-11',

                'id_solicitud_mobiliario' => 999,
                'id_solicitud_alimentacion' => 999,
                'id_solicitud_transporte' => 999,
            ]
        );

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'id_solicitud_mobiliario',
                'id_solicitud_alimentacion',
                'id_solicitud_transporte',
            ]);

        $this->assertDatabaseCount(
            'asignacion_beneficios',
            0
        );
    }

    public function test_actualiza_asignacion_de_beneficios(): void
    {
        $crear = $this->postJson(
            '/api/asignaciones-beneficios',
            [
                'id_agrupacion' =>
                    $this->agrupacion->id,

                'fecha_solicitud' =>
                    '2026-09-11',

                'id_alimentacion' =>
                    $this->alimentacion->id_alimentacion,

                'mobiliario' => [
                    'id_mobiliario' =>
                        $this->mobiliario->id_mobiliario,
                    'cantidad' => 20,
                ],

                'id_tarima' =>
                    $this->tarima->id_tarima,

                'id_aula' =>
                    $this->aula->id_aula,

                'transporte' => [
                    'matricula' =>
                        $this->transporte->matricula,
                    'id_ruta' =>
                        $this->ruta->id_ruta,
                ],
            ]
        );

        $crear->assertCreated();

        $idAsignacion = $crear->json(
            'data.id_solicitud_beneficios'
        );

        $response = $this->patchJson(
            "/api/asignaciones-beneficios/{$idAsignacion}",
            [
                'fecha_solicitud' =>
                    '2026-09-12',

                'mobiliario' => [
                    'id_mobiliario' =>
                        $this->mobiliario->id_mobiliario,
                    'cantidad' => 30,
                ],
            ]
        );

        $response->assertOk()
            ->assertJsonPath(
                'data.id_solicitud_beneficios',
                $idAsignacion
            )
            ->assertJsonPath(
                'data.fecha_solicitud',
                '2026-09-12'
            )
            ->assertJsonPath(
                'data.mobiliario.cantidad',
                30
            );

        $this->assertDatabaseHas(
            'asignacion_beneficios',
            [
                'id_solicitud_beneficios' =>
                    $idAsignacion,
                'fecha_solicitud' =>
                    '2026-09-12',
            ]
        );

        $idSolicitudMobiliario = $response->json(
            'data.mobiliario.id_solicitud_mobiliario'
        );

        $this->assertDatabaseHas(
            'solicitud_mobiliario',
            [
                'id_solicitud_mobiliario' =>
                    $idSolicitudMobiliario,
                'cantidad' => 30,
                'id_sol_mobiliario' =>
                    $this->mobiliario->id_mobiliario,
            ]
        );
    }
}