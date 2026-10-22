<?php

namespace App\Modules\Conteo\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OcupacionActualResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'fecha' => $this->resource['fecha'],
            'entradas_hoy' => $this->resource['entradas'],
            'salidas_hoy' => $this->resource['salidas'],
            'ocupacion_estimada' => $this->resource['ocupacion'],
            'ultimo_movimiento_en' => $this->resource['ultimo_movimiento_en'],
        ];
    }
}
