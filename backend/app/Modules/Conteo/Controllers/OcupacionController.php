<?php

namespace App\Modules\Conteo\Controllers;

use App\Modules\Conteo\Resources\OcupacionActualResource;
use App\Modules\Conteo\Services\OcupacionService;
use Illuminate\Http\JsonResponse;

class OcupacionController
{
    public function __construct(
        private readonly OcupacionService $ocupacionService
    ) {
    }

    public function actual(): OcupacionActualResource
    {
        return new OcupacionActualResource(
            $this->ocupacionService->actual()
        );
    }

    /**
     * Público (landing): solo la ocupación estimada, sin totales ni detalle
     * de movimientos ni sensores.
     */
    public function publica(): JsonResponse
    {
        return response()->json([
            'data' => [
                'ocupacion_estimada' => $this->ocupacionService->actual()['ocupacion'],
                'actualizado_en' => now()->toDateTimeString(),
            ],
        ]);
    }
}
