<?php

namespace App\Modules\Beneficios\Resources;

use App\Modules\SolicitudesAgrupaciones\Resources\AgrupacionResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AsignacionBeneficiosResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_solicitud_beneficios' => $this->id_solicitud_beneficios,
            'fecha_solicitud' => $this->fecha_solicitud?->toDateString(),

            'agrupacion' => new AgrupacionResource(
                $this->whenLoaded('agrupacion')
            ),

            'alimentacion' => new SolicitudAlimentacionResource(
                $this->whenLoaded('solicitudAlimentacion')
            ),

            'mobiliario' => new SolicitudMobiliarioResource(
                $this->whenLoaded('solicitudMobiliario')
            ),

            'tarima' => new TarimaResource(
                $this->whenLoaded('tarima')
            ),

            'aula' => new AulaResource(
                $this->whenLoaded('aula')
            ),

            'transporte' => new SolicitudTransporteResource(
                $this->whenLoaded('solicitudTransporte')
            ),
        ];
    }
}
