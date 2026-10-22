<?php

namespace App\Modules\Conteo\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SensorConteoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_sensor' => $this->id_sensor,
            'nombre' => $this->nombre,
            'tipo' => $this->tipo,
            'codigo' => $this->codigo,
            'activo' => $this->activo,
            // Nunca se expone el token ni su hash, solo si está configurado.
            'tiene_credenciales' => $this->token_hash !== null,
            'ultima_senal_en' => $this->ultima_senal_en?->toDateTimeString(),
            'en_linea' => $this->enLinea(),
        ];
    }
}
