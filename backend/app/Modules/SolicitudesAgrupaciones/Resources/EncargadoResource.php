<?php

namespace App\Modules\SolicitudesAgrupaciones\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EncargadoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'cedula' => $this->cedula,
            'tipo_identificacion' => $this->tipo_identificacion,
            'primer_nombre' => $this->primer_nombre,
            'apellido' => $this->apellido,
            'email' => $this->email,
            'numero_tel' => $this->numero_tel,
        ];
    }
}