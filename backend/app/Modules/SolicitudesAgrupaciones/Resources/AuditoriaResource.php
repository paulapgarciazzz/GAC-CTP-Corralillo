<?php

namespace App\Modules\SolicitudesAgrupaciones\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AuditoriaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'accion' => $this->accion,
            'fecha_accion' => $this->fecha_accion?->toISOString(),
        ];
    }
}