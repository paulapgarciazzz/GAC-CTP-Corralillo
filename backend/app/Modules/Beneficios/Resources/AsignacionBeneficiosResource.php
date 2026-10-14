<?php

namespace App\Modules\Beneficios\Resources;

use App\Modules\SolicitudesAgrupaciones\Resources\SolicitudAgrupacionResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AsignacionBeneficiosResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'id_solicitud_agrupacion' => $this->id_solicitud_agrupacion,
            'observaciones' => $this->observaciones,

            'solicitud_agrupacion' => new SolicitudAgrupacionResource(
                $this->whenLoaded('solicitudAgrupacion')
            ),

            'mobiliarios' => AsignacionMobiliarioResource::collection(
                $this->whenLoaded('mobiliarios')
            ),

            'alimentaciones' => AsignacionAlimentacionResource::collection(
                $this->whenLoaded('alimentaciones')
            ),

            'aulas' => AsignacionAulaResource::collection(
                $this->whenLoaded('aulas')
            ),

            'transportes' => AsignacionTransporteResource::collection(
                $this->whenLoaded('transportes')
            ),
        ];
    }
}
