<?php

namespace App\Modules\Conteo\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MovimientoConteoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_movimiento' => $this->id_movimiento,
            'id_sensor' => $this->id_sensor,
            'tipo' => $this->tipo,
            'identificador_evento' => $this->identificador_evento,
            'ocurrido_en' => $this->ocurrido_en?->toDateTimeString(),
            'sensor' => new SensorConteoResource($this->whenLoaded('sensor')),
        ];
    }
}
