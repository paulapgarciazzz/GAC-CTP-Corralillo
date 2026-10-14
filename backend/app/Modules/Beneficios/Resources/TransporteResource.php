<?php

namespace App\Modules\Beneficios\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransporteResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'matricula' => $this->matricula,
            'tipo' => $this->tipo,
            'capacidad' => $this->capacidad,
            'cedula_conductor' => $this->cedula_conductor,
            'nombre_conductor' => $this->nombre_conductor,
            'apellido_conductor' => $this->apellido_conductor,
        ];
    }
}
