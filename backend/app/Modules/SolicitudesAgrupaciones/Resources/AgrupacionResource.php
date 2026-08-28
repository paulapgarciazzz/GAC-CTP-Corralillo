<?php

namespace App\Modules\SolicitudesAgrupaciones\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AgrupacionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nombre' => $this->nombre,
            'lugar_procedencia' => $this->lugar_procedencia,
            'cantidad_integrantes' => $this->cantidad_integrantes,
            'resena' => $this->resena,
            'foto_url' => $this->foto_url,
            'encargado' => new EncargadoResource($this->whenLoaded('encargado')),
            'participaciones' => ParticipacionResource::collection(
                $this->whenLoaded('participaciones')
            ),
        ];
    }
}