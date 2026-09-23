<?php

namespace App\Modules\Beneficios\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AsignacionMobiliarioResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'id_mobiliario' => $this->id_mobiliario,
            'cantidad' => $this->cantidad,
            'mobiliario' => new MobiliarioResource(
                $this->whenLoaded('mobiliario')
            ),
        ];
    }
}
