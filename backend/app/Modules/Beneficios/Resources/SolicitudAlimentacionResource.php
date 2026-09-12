<?php

namespace App\Modules\Beneficios\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SolicitudAlimentacionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_solicitud_alimentacion' => $this->id_solicitud_alimentacion,

            'alimentacion' => new AlimentacionResource(
                $this->whenLoaded('alimentacion')
            ),
        ];
    }
}
