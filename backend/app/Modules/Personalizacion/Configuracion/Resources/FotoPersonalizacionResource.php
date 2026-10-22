<?php

namespace App\Modules\Personalizacion\Configuracion\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class FotoPersonalizacionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_foto' => $this->id_foto,
            'destino' => $this->destino,
            'url' => Storage::disk('public')->url($this->archivo),
            'titulo' => $this->titulo,
            'orden' => $this->orden,
            'activo' => $this->activo,
        ];
    }
}
