<?php

namespace App\Modules\SolicitudesAgrupaciones\Controllers;

use App\Modules\SolicitudesAgrupaciones\Services\ReporteService;
use Illuminate\Http\JsonResponse;

class ReporteController
{
    public function __construct(private ReporteService $service) {}

    public function agrupaciones(): JsonResponse
    {
        return response()->json([
            'data' => $this->service->obtenerReporteAgrupaciones(),
        ]);
    }
}
