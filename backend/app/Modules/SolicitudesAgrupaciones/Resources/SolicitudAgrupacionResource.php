<?php

namespace App\Modules\SolicitudesAgrupaciones\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SolicitudAgrupacionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'fecha_solicitud' => $this->fecha_solicitud?->toISOString(),
            'fecha_asignada' => $this->fecha_asignada?->toDateString(),
            'hora_asignada' => $this->hora_asignada,
            'comentarios' => $this->comentarios,
            'estado' => $this->estado?->nom_estado,
            'agrupacion' => new AgrupacionResource($this->whenLoaded('agrupacion')),
            'auditorias' => AuditoriaResource::collection(
                $this->whenLoaded('auditorias')
            ),
        ];
    }
}