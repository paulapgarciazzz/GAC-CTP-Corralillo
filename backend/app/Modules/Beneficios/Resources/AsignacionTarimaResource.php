<?php

namespace App\Modules\Beneficios\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AsignacionTarimaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'id_tarima' => $this->id_tarima,
            'tarima' => new TarimaResource(
                $this->whenLoaded('tarima')
            ),
        ];
    }
}
