<?php

namespace App\Modules\Beneficios\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SolicitudTransporteResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_solicitud_transporte' => $this->id_solicitud_transporte,

            'transporte' => new TransporteResource(
                $this->whenLoaded('transporte')
            ),

            'ruta' => new RutaResource(
                $this->whenLoaded('ruta')
            ),
        ];
    }
}
