<?php

namespace Tests\Feature;

use App\Modules\Calendario\Models\Evento;
use App\Modules\SolicitudesAgrupaciones\Models\Agrupacion;
use App\Modules\SolicitudesAgrupaciones\Models\Encargado;
use App\Modules\SolicitudesAgrupaciones\Models\Estado;
use App\Modules\SolicitudesAgrupaciones\Models\SolicitudAgrupacion;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReporteAgrupacionesTest extends TestCase
{
    use RefreshDatabase;

    private Evento $evento;

    private Evento $otroEvento;

    private Agrupacion $agrupacion;

    protected function setUp(): void
    {
        parent::setUp();

        $this->evento = Evento::create([
            'nombre' => 'Festival de Primavera',
            'fecha_inicio' => '2026-10-10',
            'fecha_fin' => '2026-10-12',
        ]);

        $this->otroEvento = Evento::create([
            'nombre' => 'Festival de Invierno',
            'fecha_inicio' => '2026-12-01',
            'fecha_fin' => '2026-12-02',
        ]);

        $encargado = Encargado::create([
            'cedula' => '123456789',
            'tipo_identificacion' => 'cedula',
            'primer_nombre' => 'Usuario',
            'apellido' => 'Prueba',
            'email' => 'reportes@test.com',
            'numero_tel' => '88880000',
        ]);

        $this->agrupacion = Agrupacion::create([
            'ced_encargado' => $encargado->cedula,
            'nombre' => 'Grupo de Baile',
            'lugar_procedencia' => 'Guanacaste',
            'cantidad_integrantes' => 20,
        ]);

        $this->crearSolicitud($this->evento, 'aprobada', '2026-09-05');
        $this->crearSolicitud($this->evento, 'pendiente', '2026-09-20');
        $this->crearSolicitud($this->evento, 'rechazada', '2026-08-15');
        $this->crearSolicitud($this->otroEvento, 'aprobada', '2026-09-10');
        $this->crearSolicitud(null, 'pendiente', '2026-07-01');
    }

    private function crearSolicitud(?Evento $evento, string $estado, string $fecha): void
    {
        SolicitudAgrupacion::create([
            'id_agrupacion' => $this->agrupacion->id,
            'id_evento' => $evento?->id_evento,
            'fecha_solicitud' => $fecha,
            'id_estado' => Estado::where('nom_estado', $estado)->firstOrFail()->id,
        ]);
    }

    /**
     * Sin evento elegido se cuentan todas las solicitudes: las de cada evento
     * y también las que no tienen evento asignado.
     */
    public function test_sin_filtro_cuenta_todas_las_solicitudes(): void
    {
        foreach (['/api/reportes/agrupaciones', '/api/reportes/agrupaciones?id_evento='] as $url) {
            $this->getJson($url)
                ->assertOk()
                ->assertJsonPath('data.recibidas', 5)
                ->assertJsonPath('data.aceptadas', 2)
                ->assertJsonPath('data.rechazadas', 1)
                ->assertJsonPath('data.pendientes', 2)
                ->assertJsonPath('data.porMes', [
                    ['mes' => '2026-07', 'total' => 1],
                    ['mes' => '2026-08', 'total' => 1],
                    ['mes' => '2026-09', 'total' => 3],
                ]);
        }
    }

    public function test_filtra_por_evento(): void
    {
        $this->getJson("/api/reportes/agrupaciones?id_evento={$this->evento->id_evento}")
            ->assertOk()
            ->assertJsonPath('data.recibidas', 3)
            ->assertJsonPath('data.aceptadas', 1)
            ->assertJsonPath('data.rechazadas', 1)
            ->assertJsonPath('data.pendientes', 1)
            ->assertJsonPath('data.porMes', [
                ['mes' => '2026-08', 'total' => 1],
                ['mes' => '2026-09', 'total' => 2],
            ]);
    }

    public function test_rechaza_evento_inexistente(): void
    {
        $this->getJson('/api/reportes/agrupaciones?id_evento=999999')
            ->assertUnprocessable()
            ->assertJsonValidationErrors('id_evento');
    }
}
