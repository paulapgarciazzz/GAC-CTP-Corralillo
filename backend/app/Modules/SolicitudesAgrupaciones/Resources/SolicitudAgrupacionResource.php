<?php

namespace App\Modules\SolicitudesAgrupaciones\Resources;

use App\Modules\Calendario\Resources\EventoResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SolicitudAgrupacionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'fecha_solicitud' => $this->fecha_solicitud?->toISOString(),
            'fecha_solicitada' => $this->fecha_solicitada?->toDateString(),
            'hora_solicitada' => $this->hora_solicitada,
            'fecha_asignada' => $this->fecha_asignada?->toDateString(),
            'hora_asignada' => $this->hora_asignada,
            'comentarios' => $this->comentarios,
            'id_evento' => $this->id_evento,
            'evento' => new EventoResource($this->whenLoaded('evento')),
            'estado' => $this->estado?->nom_estado,
            'agrupacion' => new AgrupacionResource($this->whenLoaded('agrupacion')),
            'auditorias' => AuditoriaResource::collection(
                $this->whenLoaded('auditorias')
            ),
        ];
    }
}