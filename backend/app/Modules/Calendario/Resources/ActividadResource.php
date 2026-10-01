<?php

namespace App\Modules\Calendario\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ActividadResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_actividad' => $this->id_actividad,
            'titulo' => $this->titulo,
            'fecha' => $this->fecha?->format('Y-m-d'),
            'hora_inicio' => $this->hora_inicio
                ? substr($this->hora_inicio, 0, 5)
                : null,
            'hora_finalizacion' => $this->hora_finalizacion
                ? substr($this->hora_finalizacion, 0, 5)
                : null,
            'id_evento' => $this->id_evento,
            'id_ubicacion' => $this->id_ubicacion,
            'id_estado_actividad' => $this->id_estado_actividad,
            'id_agrupacion' => $this->id_agrupacion,
            // La imagen se omite aquí para no inflar el listado; se obtiene en /ubicaciones/{id}.
            'ubicacion' => $this->whenLoaded('ubicacion', fn () => $this->ubicacion ? [
                'id_ubicacion' => $this->ubicacion->id_ubicacion,
                'nombre' => $this->ubicacion->nombre,
                'capacidad' => $this->ubicacion->capacidad,
            ] : null),
            'estado' => new EstadoActividadResource(
                $this->whenLoaded('estado')
            ),
            'agrupacion' => $this->whenLoaded('agrupacion', fn () => $this->agrupacion ? [
                'id' => $this->agrupacion->id,
                'nombre' => $this->agrupacion->nombre,
            ] : null),
        ];
    }
}
