<?php

namespace App\Modules\Beneficios\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AsignacionTransporteResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'matricula' => $this->matricula,
            'id_ruta' => $this->id_ruta,
            'transporte' => new TransporteResource(
                $this->whenLoaded('transporte')
            ),
            'ruta' => new RutaResource(
                $this->whenLoaded('ruta')
            ),
        ];
    }
}
