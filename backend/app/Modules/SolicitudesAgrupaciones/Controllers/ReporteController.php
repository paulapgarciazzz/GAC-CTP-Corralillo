<?php

namespace App\Modules\SolicitudesAgrupaciones\Controllers;

use App\Modules\SolicitudesAgrupaciones\Requests\ReporteAgrupacionesRequest;
use App\Modules\SolicitudesAgrupaciones\Services\ReporteService;
use Illuminate\Http\JsonResponse;

class ReporteController
{
    public function __construct(private ReporteService $service) {}

    public function agrupaciones(ReporteAgrupacionesRequest $request): JsonResponse
    {
        $idEvento = $request->validated('id_evento');

        return response()->json([
            'data' => $this->service->obtenerReporteAgrupaciones(
                $idEvento !== null ? (int) $idEvento : null
            ),
        ]);
    }
}
