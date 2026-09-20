<?php

namespace App\Modules\Beneficios\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AsignacionAlimentacionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'id_alimentacion' => $this->id_alimentacion,
            'cantidad' => $this->cantidad,
            'alimentacion' => new AlimentacionResource(
                $this->whenLoaded('alimentacion')
            ),
        ];
    }
}
