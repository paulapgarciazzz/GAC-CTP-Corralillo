<?php

namespace App\Modules\Beneficios\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MobiliarioResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_mobiliario' => $this->id_mobiliario,
            'nombre' => $this->nombre,
        ];
    }
}
