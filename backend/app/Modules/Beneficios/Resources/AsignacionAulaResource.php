<?php

namespace App\Modules\Beneficios\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AsignacionAulaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'id_aula' => $this->id_aula,
            'aula' => new AulaResource(
                $this->whenLoaded('aula')
            ),
        ];
    }
}
