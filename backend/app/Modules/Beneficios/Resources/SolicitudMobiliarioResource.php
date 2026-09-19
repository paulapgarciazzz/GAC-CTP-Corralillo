<?php

namespace App\Modules\Beneficios\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SolicitudMobiliarioResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_solicitud_mobiliario' => $this->id_solicitud_mobiliario,
            'cantidad' => $this->cantidad,

            'mobiliario' => new MobiliarioResource(
                $this->whenLoaded('mobiliario')
            ),
        ];
    }
}
