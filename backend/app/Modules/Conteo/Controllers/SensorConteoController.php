<?php

namespace App\Modules\Conteo\Controllers;

use App\Modules\Conteo\Models\SensorConteo;
use App\Modules\Conteo\Resources\SensorConteoResource;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class SensorConteoController
{
    /**
     * Sensores con su estado de conexión, para el panel.
     */
    public function index(): AnonymousResourceCollection
    {
        return SensorConteoResource::collection(
            SensorConteo::query()->orderBy('tipo')->orderBy('codigo')->get()
        );
    }
}
