<?php

namespace App\Modules\Calendario\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EventoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_evento' => $this->id_evento,
            'nombre' => $this->nombre,
            'fecha_inicio' => $this->fecha_inicio?->format('Y-m-d'),
            'fecha_fin' => $this->fecha_fin?->format('Y-m-d'),
            'hora_inicio' => $this->hora_inicio
                ? substr($this->hora_inicio, 0, 5)
                : null,
            'hora_fin' => $this->hora_fin
                ? substr($this->hora_fin, 0, 5)
                : null,
            'todo_el_dia' => $this->todo_el_dia,
            'categoria' => $this->categoria,
            'estado' => $this->estado,
        ];
    }
}
