<?php

namespace App\Modules\Calendario\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UbicacionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_ubicacion' => $this->id_ubicacion,
            'nombre' => $this->nombre,
            'descripcion' => $this->descripcion,
            'capacidad' => $this->capacidad,
            'imagen' => $this->imagen,
        ];
    }
}
