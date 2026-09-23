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
            'cantidad_disponible' => 100,
            'encargado' => 'Carlos Pérez',
        ]);

        $this->aula = Aula::create([
            'nombre' => 'Aula Principal',
            'capacidad' => 50,
            'encargado' => 'María Rodríguez',
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

    private function crearSolicitudAprobada(?Agrupacion $agrupacion = null): SolicitudAgrupacion
    {
        $estadoAprobada = Estado::where('nom_estado', 'aprobada')->firstOrFail();

        return SolicitudAgrupacion::create([
            'id_agrupacion' => ($agrupacion ?? $this->agrupacion)->id,
            'ced_encargado' => '123456789',
            'fecha_solicitud' => now(),
            'id_estado' => $estadoAprobada->id,
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
            ->assertJsonPath('data.0.nombre', 'Aula Principal')
            ->assertJsonPath('data.0.encargado', 'María Rodríguez');

        $this->getJson('/api/mobiliarios')
            ->assertOk()
            ->assertJsonPath('data.0.nombre', 'Sillas')
            ->assertJsonPath('data.0.cantidad_disponible', 100)
            ->assertJsonPath('data.0.encargado', 'Carlos Pérez');

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

    public function test_actualiza_catalogos_sin_cambiar_valores_unicos_y_rechaza_duplicados(): void
    {
        $this->patchJson("/api/alimentaciones/{$this->alimentacion->id_alimentacion}", [
            'tiempo_comida' => 'Almuerzo',
        ])->assertOk();

        $alimentacionDuplicada = Alimentacion::create(['tiempo_comida' => 'Cena']);
        $this->patchJson("/api/alimentaciones/{$this->alimentacion->id_alimentacion}", [
            'tiempo_comida' => $alimentacionDuplicada->tiempo_comida,
        ])->assertStatus(422)->assertJsonValidationErrors(['tiempo_comida']);

        $this->patchJson("/api/aulas/{$this->aula->id_aula}", [
            'nombre' => 'Aula Principal',
            'encargado' => 'María Rodríguez Solano',
        ])->assertOk()
            ->assertJsonPath('data.encargado', 'María Rodríguez Solano');

        $aulaDuplicada = Aula::create(['nombre' => 'Aula Secundaria', 'capacidad' => 30]);
        $this->patchJson("/api/aulas/{$this->aula->id_aula}", [
            'nombre' => $aulaDuplicada->nombre,
        ])->assertStatus(422)->assertJsonValidationErrors(['nombre']);

        $this->patchJson("/api/mobiliarios/{$this->mobiliario->id_mobiliario}", [
            'nombre' => 'Sillas',
            'cantidad_disponible' => 120,
        ])->assertOk()
            ->assertJsonPath('data.cantidad_disponible', 120);

        $mobiliarioDuplicado = Mobiliario::create(['nombre' => 'Mesas']);
        $this->patchJson("/api/mobiliarios/{$this->mobiliario->id_mobiliario}", [
            'nombre' => $mobiliarioDuplicado->nombre,
        ])->assertStatus(422)->assertJsonValidationErrors(['nombre']);

        $this->patchJson("/api/rutas/{$this->ruta->id_ruta}", [
            'nombre_ruta' => 'Ruta Santa Cruz',
        ])->assertOk();

        $rutaDuplicada = Ruta::create(['nombre_ruta' => 'Ruta Liberia']);
        $this->patchJson("/api/rutas/{$this->ruta->id_ruta}", [
            'nombre_ruta' => $rutaDuplicada->nombre_ruta,
        ])->assertStatus(422)->assertJsonValidationErrors(['nombre_ruta']);

        $this->patchJson("/api/tarimas/{$this->tarima->id_tarima}", [
            'nombre' => 'Tarima Principal',
        ])->assertOk();

        $tarimaDuplicada = Tarima::create(['nombre' => 'Tarima Secundaria']);
        $this->patchJson("/api/tarimas/{$this->tarima->id_tarima}", [
            'nombre' => $tarimaDuplicada->nombre,
        ])->assertStatus(422)->assertJsonValidationErrors(['nombre']);
    }

    public function test_aula_guarda_encargado(): void
    {
        $response = $this->postJson('/api/aulas', [
            'nombre' => 'Aula Nueva',
            'capacidad' => 25,
            'encargado' => 'Ana Jiménez',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.encargado', 'Ana Jiménez');

        $this->assertDatabaseHas('aula', [
            'nombre' => 'Aula Nueva',
            'encargado' => 'Ana Jiménez',
        ]);
    }

    public function test_mobiliario_guarda_cantidad_y_encargado(): void
    {
        $response = $this->postJson('/api/mobiliarios', [
            'nombre' => 'Mesas plegables',
            'cantidad_disponible' => 40,
            'encargado' => 'Luis Vargas',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.cantidad_disponible', 40)
            ->assertJsonPath('data.encargado', 'Luis Vargas');

        $this->assertDatabaseHas('mobiliario', [
            'nombre' => 'Mesas plegables',
            'cantidad_disponible' => 40,
            'encargado' => 'Luis Vargas',
        ]);
    }

    public function test_crea_asignacion_para_solicitud_aprobada_con_varios_beneficios_del_mismo_tipo(): void
    {
        $solicitud = $this->crearSolicitudAprobada();

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
                    ['id_alimentacion' => $this->alimentacion->id_alimentacion],
                ],
                'aulas' => [
                    ['id_aula' => $this->aula->id_aula],
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
            ->assertJsonPath('data.alimentaciones.0.cantidad', 20)
            ->assertJsonMissingPath('data.tarimas');

        $this->assertDatabaseHas('asignacion_beneficios', [
            'id_solicitud_agrupacion' => $solicitud->id,
            'observaciones' => 'Asignación revisada',
        ]);

        $this->assertDatabaseCount('asignacion_mobiliario', 2);
        $this->assertDatabaseCount('asignacion_alimentacion', 1);
        $this->assertDatabaseCount('asignacion_tarima', 0);
    }

    public function test_alimentacion_asignada_usa_automaticamente_cantidad_integrantes(): void
    {
        $solicitud = $this->crearSolicitudAprobada();

        $response = $this->postJson('/api/asignaciones-beneficios', [
            'id_solicitud_agrupacion' => $solicitud->id,
            'alimentaciones' => [
                ['id_alimentacion' => $this->alimentacion->id_alimentacion],
            ],
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.alimentaciones.0.cantidad', 20);

        $this->assertDatabaseHas('asignacion_alimentacion', [
            'id_alimentacion' => $this->alimentacion->id_alimentacion,
            'cantidad' => 20,
        ]);
    }

    public function test_cliente_no_puede_alterar_manualmente_la_cantidad_de_alimentacion(): void
    {
        $solicitud = $this->crearSolicitudAprobada();

        $response = $this->postJson('/api/asignaciones-beneficios', [
            'id_solicitud_agrupacion' => $solicitud->id,
            'alimentaciones' => [
                ['id_alimentacion' => $this->alimentacion->id_alimentacion, 'cantidad' => 999],
            ],
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.alimentaciones.0.cantidad', 20);

        $this->assertDatabaseHas('asignacion_alimentacion', [
            'id_alimentacion' => $this->alimentacion->id_alimentacion,
            'cantidad' => 20,
        ]);

        $this->assertDatabaseMissing('asignacion_alimentacion', [
            'id_alimentacion' => $this->alimentacion->id_alimentacion,
            'cantidad' => 999,
        ]);
    }

    public function test_solicitud_de_22_integrantes_con_desayuno_y_almuerzo_produce_cantidades_automaticas(): void
    {
        $agrupacionGrande = Agrupacion::create([
            'ced_encargado' => $this->agrupacion->ced_encargado,
            'nombre' => 'Agrupacion Grande',
            'lugar_procedencia' => 'Guanacaste',
            'cantidad_integrantes' => 22,
        ]);

        $solicitud = $this->crearSolicitudAprobada($agrupacionGrande);

        $desayuno = Alimentacion::create(['tiempo_comida' => 'Desayuno']);

        $response = $this->postJson('/api/asignaciones-beneficios', [
            'id_solicitud_agrupacion' => $solicitud->id,
            'alimentaciones' => [
                ['id_alimentacion' => $desayuno->id_alimentacion],
                ['id_alimentacion' => $this->alimentacion->id_alimentacion],
            ],
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.alimentaciones.0.cantidad', 22)
            ->assertJsonPath('data.alimentaciones.1.cantidad', 22);

        $this->assertDatabaseHas('asignacion_alimentacion', [
            'id_alimentacion' => $desayuno->id_alimentacion,
            'cantidad' => 22,
        ]);

        $this->assertDatabaseHas('asignacion_alimentacion', [
            'id_alimentacion' => $this->alimentacion->id_alimentacion,
            'cantidad' => 22,
        ]);
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
        $solicitud = $this->crearSolicitudAprobada();

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
                'tarimas' => [
                    ['id_tarima' => $this->tarima->id_tarima],
                ],
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
                'tarimas',
            ]);

        $this->assertDatabaseCount('asignacion_beneficios', 0);
    }

    public function test_no_permite_mas_de_una_cabecera_por_solicitud(): void
    {
        $solicitud = $this->crearSolicitudAprobada();

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
        $solicitud = $this->crearSolicitudAprobada();

        $crear = $this->postJson('/api/asignaciones-beneficios', [
            'id_solicitud_agrupacion' => $solicitud->id,
            'observaciones' => 'Inicial',
            'mobiliarios' => [
                ['id_mobiliario' => $this->mobiliario->id_mobiliario, 'cantidad' => 20],
            ],
            'alimentaciones' => [
                ['id_alimentacion' => $this->alimentacion->id_alimentacion],
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
        $solicitud = $this->crearSolicitudAprobada();

        $crear = $this->postJson(
            '/api/asignaciones-beneficios',
            [
                'id_solicitud_agrupacion' => $solicitud->id,
                'observaciones' => 'Inicial',
                'mobiliarios' => [
                    ['id_mobiliario' => $this->mobiliario->id_mobiliario, 'cantidad' => 20],
                ],
                'alimentaciones' => [
                    ['id_alimentacion' => $this->alimentacion->id_alimentacion],
                ],
                'aulas' => [
                    ['id_aula' => $this->aula->id_aula],
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
                'alimentaciones' => [
                    ['id_alimentacion' => $this->alimentacion->id_alimentacion],
                ],
            ]
        );

        $response->assertOk()
            ->assertJsonPath('data.id', $idAsignacion)
            ->assertJsonPath('data.observaciones', 'Actualizada')
            ->assertJsonPath('data.mobiliarios.0.cantidad', 30)
            ->assertJsonPath('data.alimentaciones.0.cantidad', 20);

        $this->assertDatabaseHas('asignacion_beneficios', [
            'id' => $idAsignacion,
            'observaciones' => 'Actualizada',
        ]);

        $this->assertDatabaseHas('asignacion_mobiliario', [
            'id_asignacion_beneficios' => $idAsignacion,
            'cantidad' => 30,
        ]);

        $this->assertDatabaseHas('asignacion_alimentacion', [
            'id_asignacion_beneficios' => $idAsignacion,
            'cantidad' => 20,
        ]);
    }
}
