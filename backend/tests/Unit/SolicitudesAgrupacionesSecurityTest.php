<?php

namespace Tests\Unit;

use App\Modules\SolicitudesAgrupaciones\Models\Auditoria;
use App\Modules\SolicitudesAgrupaciones\Models\SolicitudAgrupacion;
use App\Modules\SolicitudesAgrupaciones\Requests\StoreSolicitudAgrupacionRequest;
use App\Modules\SolicitudesAgrupaciones\Requests\StoreParticipacionRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Tests\TestCase;

class SolicitudesAgrupacionesSecurityTest extends TestCase
{
    public function test_request_excludes_internal_solicitud_fields(): void
    {
        $rules = (new StoreSolicitudAgrupacionRequest)->rules();

        $this->assertArrayHasKey('id_agrupacion', $rules);
        $this->assertArrayHasKey('fecha_solicitud', $rules);
        $this->assertContains('prohibited', $rules['id_estado']);
        $this->assertContains('nullable', $rules['fecha_asignada']);
        $this->assertContains('nullable', $rules['hora_asignada']);
    }

    public function test_participation_request_does_not_accept_parent_id(): void
    {
        $this->assertArrayNotHasKey(
            'id_agrupacion',
            (new StoreParticipacionRequest)->rules()
        );
    }

    public function test_models_do_not_have_unrestricted_mass_assignment(): void
    {
        $this->assertNotSame([], (new SolicitudAgrupacion)->getFillable());
        $this->assertNotSame([], (new SolicitudAgrupacion)->getGuarded());
        $this->assertSame(['*'], (new Auditoria)->getGuarded());
    }

    public function test_group_routes_use_the_expected_binding_parameter(): void
    {
        $route = Route::getRoutes()->getByName('agrupaciones.show');

        $this->assertNotNull($route);
        $this->assertSame(
            ['agrupacion'],
            array_values($route->parameterNames())
        );
    }

    public function test_api_errors_are_clean_when_debug_is_disabled(): void
    {
        config(['app.debug' => false]);

        $response = app('Illuminate\\Contracts\\Debug\\ExceptionHandler')
            ->render(
                Request::create('/api/test', 'GET'),
                new HttpException(422, 'Operacion invalida.')
            );

        $this->assertSame(422, $response->getStatusCode());
        $payload = json_decode($response->getContent(), true);

        $this->assertSame(['message' => 'Operacion invalida.'], $payload);
        $this->assertArrayNotHasKey('exception', $payload);
        $this->assertArrayNotHasKey('file', $payload);
        $this->assertArrayNotHasKey('line', $payload);
        $this->assertArrayNotHasKey('trace', $payload);
    }
}