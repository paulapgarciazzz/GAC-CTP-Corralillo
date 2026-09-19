<?php

namespace App\Modules\Beneficios\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RutaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_ruta' => $this->id_ruta,
            'nombre_ruta' => $this->nombre_ruta,
        ];
    }
}
