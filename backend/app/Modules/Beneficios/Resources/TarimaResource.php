<?php

namespace App\Modules\Beneficios\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TarimaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_tarima' => $this->id_tarima,
            'nombre' => $this->nombre,
        ];
    }
}
