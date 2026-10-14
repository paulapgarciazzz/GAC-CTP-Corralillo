<?php

namespace Tests\Feature;

use App\Modules\Beneficios\Models\Alimentacion;
use App\Modules\Beneficios\Models\AsignacionAlimentacion;
use App\Modules\Beneficios\Models\AsignacionAula;
use App\Modules\Beneficios\Models\AsignacionBeneficios;
use App\Modules\Beneficios\Models\AsignacionMobiliario;
use App\Modules\Beneficios\Models\AsignacionTransporte;
use App\Modules\Beneficios\Models\Aula;
use App\Modules\Beneficios\Models\Mobiliario;
use App\Modules\Beneficios\Models\Ruta;
use App\Modules\Beneficios\Models\Transporte;
use App\Modules\SolicitudesAgrupaciones\Models\Agrupacion;
use App\Modules\SolicitudesAgrupaciones\Models\Encargado;
use App\Modules\SolicitudesAgrupaciones\Models\Estado;
use App\Modules\SolicitudesAgrupaciones\Models\SolicitudAgrupacion;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BeneficiosReportTest extends TestCase
{
    use RefreshDatabase;

    private Encargado $encargado;

    private int $idEstadoAprobada;

    protected function setUp(): void
    {
        parent::setUp();

        $this->encargado = Encargado::create([
            'cedula' => '900000000',
            'tipo_identificacion' => 'cedula',
            'primer_nombre' => 'Reportes',
            'apellido' => 'Prueba',
            'email' => 'reportes@test.com',
            'numero_tel' => '88880001',
        ]);

        $this->idEstadoAprobada = Estado::where('nom_estado', 'aprobada')->firstOrFail()->id;
    }

    private function crearAsignacion(string $fechaAsignada, int $cantidadIntegrantes = 20, string $nombreAgrupacion = 'Agrupacion Prueba'): AsignacionBeneficios
    {
        $agrupacion = Agrupacion::create([
            'ced_encargado' => $this->encargado->cedula,
            'nombre' => $nombreAgrupacion,
            'lugar_procedencia' => 'Guanacaste',
            'cantidad_integrantes' => $cantidadIntegrantes,
        ]);

        $solicitud = SolicitudAgrupacion::create([
            'id_agrupacion' => $agrupacion->id,
            'ced_encargado' => $this->encargado->cedula,
            'fecha_solicitud' => now(),
            'fecha_asignada' => $fechaAsignada,
            'id_estado' => $this->idEstadoAprobada,
        ]);

        return AsignacionBeneficios::create([
            'id_solicitud_agrupacion' => $solicitud->id,
        ]);
    }

    public function test_filtra_por_dia(): void
    {
        $dentro = $this->crearAsignacion('2026-09-10');
        $fuera = $this->crearAsignacion('2026-09-11');

        $desayuno = Alimentacion::firstOrCreate(['tiempo_comida' => 'Desayuno']);

        AsignacionAlimentacion::create(['id_asignacion_beneficios' => $dentro->id, 'id_alimentacion' => $desayuno->id_alimentacion, 'cantidad' => 10]);
        AsignacionAlimentacion::create(['id_asignacion_beneficios' => $fuera->id, 'id_alimentacion' => $desayuno->id_alimentacion, 'cantidad' => 99]);

        $response = $this->getJson('/api/reportes/beneficios?fecha_desde=2026-09-10&fecha_hasta=2026-09-10&categoria=alimentacion');

        $response->assertOk()
            ->assertJsonCount(1, 'data.alimentacion.detalle')
            ->assertJsonPath('data.alimentacion.total_general', 10);
    }

    public function test_filtra_por_semana(): void
    {
        $dentroInicio = $this->crearAsignacion('2026-09-07');
        $dentroFin = $this->crearAsignacion('2026-09-13');
        $fuera = $this->crearAsignacion('2026-09-14');

        $mobiliario = Mobiliario::create(['nombre' => 'Sillas']);

        AsignacionMobiliario::create(['id_asignacion_beneficios' => $dentroInicio->id, 'id_mobiliario' => $mobiliario->id_mobiliario, 'cantidad' => 5]);
        AsignacionMobiliario::create(['id_asignacion_beneficios' => $dentroFin->id, 'id_mobiliario' => $mobiliario->id_mobiliario, 'cantidad' => 7]);
        AsignacionMobiliario::create(['id_asignacion_beneficios' => $fuera->id, 'id_mobiliario' => $mobiliario->id_mobiliario, 'cantidad' => 100]);

        $response = $this->getJson('/api/reportes/beneficios?fecha_desde=2026-09-07&fecha_hasta=2026-09-13&categoria=mobiliario');

        $response->assertOk()
            ->assertJsonCount(2, 'data.mobiliario.detalle')
            ->assertJsonPath('data.mobiliario.total_general', 12);
    }

    public function test_filtra_por_mes(): void
    {
        $dentro = $this->crearAsignacion('2026-09-15');
        $fueraMesAnterior = $this->crearAsignacion('2026-08-31');
        $fueraMesSiguiente = $this->crearAsignacion('2026-10-01');

        $aula = Aula::create(['nombre' => 'Aula X', 'capacidad' => 50]);

        AsignacionAula::create(['id_asignacion_beneficios' => $dentro->id, 'id_aula' => $aula->id_aula]);
        AsignacionAula::create(['id_asignacion_beneficios' => $fueraMesAnterior->id, 'id_aula' => $aula->id_aula]);
        AsignacionAula::create(['id_asignacion_beneficios' => $fueraMesSiguiente->id, 'id_aula' => $aula->id_aula]);

        $response = $this->getJson('/api/reportes/beneficios?fecha_desde=2026-09-01&fecha_hasta=2026-09-30&categoria=aula');

        $response->assertOk()
            ->assertJsonCount(1, 'data.aula.detalle')
            ->assertJsonPath('data.aula.totales.total_aulas_asignadas', 1);
    }

    public function test_filtra_por_rango_personalizado(): void
    {
        $dentro1 = $this->crearAsignacion('2026-09-05');
        $dentro2 = $this->crearAsignacion('2026-09-20');
        $fuera = $this->crearAsignacion('2026-10-05');

        $mobiliario = Mobiliario::create(['nombre' => 'Mesas']);

        AsignacionMobiliario::create(['id_asignacion_beneficios' => $dentro1->id, 'id_mobiliario' => $mobiliario->id_mobiliario, 'cantidad' => 3]);
        AsignacionMobiliario::create(['id_asignacion_beneficios' => $dentro2->id, 'id_mobiliario' => $mobiliario->id_mobiliario, 'cantidad' => 4]);
        AsignacionMobiliario::create(['id_asignacion_beneficios' => $fuera->id, 'id_mobiliario' => $mobiliario->id_mobiliario, 'cantidad' => 50]);

        $response = $this->getJson('/api/reportes/beneficios?fecha_desde=2026-09-01&fecha_hasta=2026-09-30&categoria=mobiliario');

        $response->assertOk()->assertJsonPath('data.mobiliario.total_general', 7);
    }

    public function test_filtra_por_categoria_especifica_omite_las_demas(): void
    {
        $asignacion = $this->crearAsignacion('2026-09-10');
        $mobiliario = Mobiliario::create(['nombre' => 'Sillas']);
        AsignacionMobiliario::create(['id_asignacion_beneficios' => $asignacion->id, 'id_mobiliario' => $mobiliario->id_mobiliario, 'cantidad' => 5]);

        $response = $this->getJson('/api/reportes/beneficios?fecha_desde=2026-09-01&fecha_hasta=2026-09-30&categoria=mobiliario');

        $response->assertOk()
            ->assertJsonMissingPath('data.alimentacion')
            ->assertJsonMissingPath('data.aula')
            ->assertJsonMissingPath('data.transporte')
            ->assertJsonStructure(['data' => ['mobiliario', 'resumen' => ['mobiliario']]]);
    }

    public function test_filtra_por_tipo_de_alimentacion(): void
    {
        $asignacion = $this->crearAsignacion('2026-09-10', 22);

        $desayuno = Alimentacion::firstOrCreate(['tiempo_comida' => 'Desayuno']);
        $almuerzo = Alimentacion::firstOrCreate(['tiempo_comida' => 'Almuerzo']);

        AsignacionAlimentacion::create(['id_asignacion_beneficios' => $asignacion->id, 'id_alimentacion' => $desayuno->id_alimentacion, 'cantidad' => 22]);
        AsignacionAlimentacion::create(['id_asignacion_beneficios' => $asignacion->id, 'id_alimentacion' => $almuerzo->id_alimentacion, 'cantidad' => 22]);

        $response = $this->getJson('/api/reportes/beneficios?fecha_desde=2026-09-01&fecha_hasta=2026-09-30&categoria=alimentacion&tipo_alimentacion=Desayuno');

        $response->assertOk()
            ->assertJsonCount(1, 'data.alimentacion.detalle')
            ->assertJsonPath('data.alimentacion.detalle.0.tipo_alimentacion', 'Desayuno')
            ->assertJsonPath('data.alimentacion.total_general', 22);
    }

    public function test_total_de_desayunos_suma_varias_agrupaciones(): void
    {
        $agrupacionA = $this->crearAsignacion('2026-09-10', 22, 'Agrupacion A');
        $agrupacionB = $this->crearAsignacion('2026-09-12', 30, 'Agrupacion B');

        $desayuno = Alimentacion::firstOrCreate(['tiempo_comida' => 'Desayuno']);

        AsignacionAlimentacion::create(['id_asignacion_beneficios' => $agrupacionA->id, 'id_alimentacion' => $desayuno->id_alimentacion, 'cantidad' => 22]);
        AsignacionAlimentacion::create(['id_asignacion_beneficios' => $agrupacionB->id, 'id_alimentacion' => $desayuno->id_alimentacion, 'cantidad' => 30]);

        $response = $this->getJson('/api/reportes/beneficios?fecha_desde=2026-09-01&fecha_hasta=2026-09-30&categoria=alimentacion');

        $response->assertOk()
            ->assertJsonFragment(['tipo_alimentacion' => 'Desayuno', 'total' => 52])
            ->assertJsonPath('data.alimentacion.total_general', 52);
    }

    public function test_total_de_mobiliario_por_tipo(): void
    {
        $a = $this->crearAsignacion('2026-09-10');
        $b = $this->crearAsignacion('2026-09-11');

        $sillas = Mobiliario::create(['nombre' => 'Sillas']);
        $mesas = Mobiliario::create(['nombre' => 'Mesas']);

        AsignacionMobiliario::create(['id_asignacion_beneficios' => $a->id, 'id_mobiliario' => $sillas->id_mobiliario, 'cantidad' => 20]);
        AsignacionMobiliario::create(['id_asignacion_beneficios' => $b->id, 'id_mobiliario' => $sillas->id_mobiliario, 'cantidad' => 30]);
        AsignacionMobiliario::create(['id_asignacion_beneficios' => $b->id, 'id_mobiliario' => $mesas->id_mobiliario, 'cantidad' => 10]);

        $response = $this->getJson('/api/reportes/beneficios?fecha_desde=2026-09-01&fecha_hasta=2026-09-30&categoria=mobiliario');

        $response->assertOk()
            ->assertJsonFragment(['mobiliario' => 'Sillas', 'total' => 50])
            ->assertJsonFragment(['mobiliario' => 'Mesas', 'total' => 10])
            ->assertJsonPath('data.mobiliario.total_general', 60);
    }

    public function test_mobiliario_incluye_el_encargado(): void
    {
        $asignacion = $this->crearAsignacion('2026-09-10', 20, 'Agrupacion Mobiliario');

        $sillas = Mobiliario::create(['nombre' => 'Sillas', 'encargado' => 'Carlos Pérez']);

        AsignacionMobiliario::create(['id_asignacion_beneficios' => $asignacion->id, 'id_mobiliario' => $sillas->id_mobiliario, 'cantidad' => 20]);

        $response = $this->getJson('/api/reportes/beneficios?fecha_desde=2026-09-01&fecha_hasta=2026-09-30&categoria=mobiliario');

        $response->assertOk()
            ->assertJsonPath('data.mobiliario.detalle.0.mobiliario', 'Sillas')
            ->assertJsonPath('data.mobiliario.detalle.0.encargado', 'Carlos Pérez');
    }

    public function test_total_de_vehiculos_asignados(): void
    {
        $a = $this->crearAsignacion('2026-09-10');
        $b = $this->crearAsignacion('2026-09-11');

        $ruta = Ruta::create(['nombre_ruta' => 'Ruta Santa Cruz']);
        $bus1 = Transporte::create(['matricula' => 'BUS001', 'tipo' => 'Bus', 'capacidad' => 40, 'cedula_conductor' => '1111111111', 'nombre_conductor' => 'Carlos', 'apellido_conductor' => 'Mora']);
        $bus2 = Transporte::create(['matricula' => 'BUS002', 'tipo' => 'Buseta', 'capacidad' => 20, 'cedula_conductor' => '2222222222', 'nombre_conductor' => 'Ana', 'apellido_conductor' => 'Solis']);

        AsignacionTransporte::create(['id_asignacion_beneficios' => $a->id, 'matricula' => $bus1->matricula, 'id_ruta' => $ruta->id_ruta]);
        AsignacionTransporte::create(['id_asignacion_beneficios' => $b->id, 'matricula' => $bus2->matricula, 'id_ruta' => $ruta->id_ruta]);

        $response = $this->getJson('/api/reportes/beneficios?fecha_desde=2026-09-01&fecha_hasta=2026-09-30&categoria=transporte');

        $response->assertOk()->assertJsonPath('data.transporte.totales.total_vehiculos_asignados', 2);
    }

    public function test_detecta_sobrecapacidad_de_aula(): void
    {
        $conSobrecapacidad = $this->crearAsignacion('2026-09-10', 45, 'Agrupacion Grande');
        $sinSobrecapacidad = $this->crearAsignacion('2026-09-11', 20, 'Agrupacion Normal');

        $aula = Aula::create(['nombre' => 'Aula Pequeña', 'capacidad' => 25, 'encargado' => 'María Rodríguez']);

        AsignacionAula::create(['id_asignacion_beneficios' => $conSobrecapacidad->id, 'id_aula' => $aula->id_aula]);
        AsignacionAula::create(['id_asignacion_beneficios' => $sinSobrecapacidad->id, 'id_aula' => $aula->id_aula]);

        $response = $this->getJson('/api/reportes/beneficios?fecha_desde=2026-09-01&fecha_hasta=2026-09-30&categoria=aula');

        $response->assertOk()
            ->assertJsonPath('data.aula.totales.asignaciones_con_sobrecapacidad', 1);

        $detalle = collect($response->json('data.aula.detalle'));
        $filaSobrecapacidad = $detalle->firstWhere('agrupacion', 'Agrupacion Grande');
        $filaNormal = $detalle->firstWhere('agrupacion', 'Agrupacion Normal');

        $this->assertTrue($filaSobrecapacidad['sobrecapacidad']);
        $this->assertSame(20, $filaSobrecapacidad['exceso']);
        $this->assertFalse($filaNormal['sobrecapacidad']);
        $this->assertSame(0, $filaNormal['exceso']);
    }

    public function test_transporte_incluye_todos_los_datos(): void
    {
        $asignacion = $this->crearAsignacion('2026-09-10', 20, 'Agrupacion Transporte');

        $ruta = Ruta::create(['nombre_ruta' => 'Ruta Liberia']);
        $transporte = Transporte::create([
            'matricula' => 'BUS003',
            'tipo' => 'Microbus',
            'capacidad' => 15,
            'cedula_conductor' => '3333333333',
            'nombre_conductor' => 'Luis',
            'apellido_conductor' => 'Vargas',
        ]);

        AsignacionTransporte::create(['id_asignacion_beneficios' => $asignacion->id, 'matricula' => $transporte->matricula, 'id_ruta' => $ruta->id_ruta]);

        $response = $this->getJson('/api/reportes/beneficios?fecha_desde=2026-09-01&fecha_hasta=2026-09-30&categoria=transporte');

        $response->assertOk()
            ->assertJsonPath('data.transporte.detalle.0.matricula', 'BUS003')
            ->assertJsonPath('data.transporte.detalle.0.tipo', 'Microbus')
            ->assertJsonPath('data.transporte.detalle.0.capacidad', 15)
            ->assertJsonPath('data.transporte.detalle.0.nombre_conductor', 'Luis')
            ->assertJsonPath('data.transporte.detalle.0.apellido_conductor', 'Vargas')
            ->assertJsonPath('data.transporte.detalle.0.cedula_conductor', '3333333333')
            ->assertJsonPath('data.transporte.detalle.0.ruta', 'Ruta Liberia')
            ->assertJsonPath('data.transporte.detalle.0.agrupacion', 'Agrupacion Transporte');
    }

    public function test_reporte_vacio_no_falla(): void
    {
        $response = $this->getJson('/api/reportes/beneficios?fecha_desde=2026-01-01&fecha_hasta=2026-01-31&categoria=todos');

        $response->assertOk()
            ->assertJsonPath('data.alimentacion.detalle', [])
            ->assertJsonPath('data.alimentacion.total_general', 0)
            ->assertJsonPath('data.mobiliario.total_general', 0)
            ->assertJsonPath('data.aula.totales.total_aulas_asignadas', 0)
            ->assertJsonPath('data.transporte.totales.total_vehiculos_asignados', 0);
    }
}
