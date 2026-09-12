<?php

namespace App\Modules\Beneficios\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AlimentacionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_alimentacion' => $this->id_alimentacion,
            'tiempo_comida' => $this->tiempo_comida,
        ];
    }
}
