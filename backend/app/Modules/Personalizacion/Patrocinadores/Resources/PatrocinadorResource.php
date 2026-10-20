<?php

namespace App\Modules\Personalizacion\Patrocinadores\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class PatrocinadorResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_patrocinador' => $this->id_patrocinador,
            'nombre' => $this->nombre,
            'logotipo_url' => Storage::disk('public')->url($this->logotipo),
            'descripcion' => $this->descripcion,
            'enlace' => $this->enlace,
            'categoria' => $this->categoria,
            'orden' => $this->orden,
            'activo' => $this->activo,
        ];
    }
}
