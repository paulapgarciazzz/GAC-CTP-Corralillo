<?php

namespace App\Modules\SolicitudesAgrupaciones\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ParticipacionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'lugar' => $this->lugar,
            'fecha' => $this->fecha?->toDateString(),
        ];
    }
}