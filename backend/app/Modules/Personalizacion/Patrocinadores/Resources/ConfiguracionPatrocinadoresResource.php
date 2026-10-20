<?php

namespace App\Modules\Personalizacion\Patrocinadores\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConfiguracionPatrocinadoresResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'titulo' => $this->titulo,
            'descripcion' => $this->descripcion,
        ];
    }
}
