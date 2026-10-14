<?php

namespace App\Modules\Calendario\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EstadoActividadResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_estado_actividad' => $this->id_estado_actividad,
            'nombre' => $this->nombre,
            'descripcion' => $this->descripcion,
        ];
    }
}
