<?php

namespace App\Modules\Personalizacion\Patrocinadores\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Personalizacion\Patrocinadores\Resources\ConfiguracionPatrocinadoresResource;
use App\Modules\Personalizacion\Patrocinadores\Resources\PatrocinadorResource;
use App\Modules\Personalizacion\Patrocinadores\Services\ConfiguracionPatrocinadoresService;
use App\Modules\Personalizacion\Patrocinadores\Services\PatrocinadorService;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * Endpoints públicos, de solo lectura, consumidos por la landing.
 * Nunca exponen patrocinadores inactivos.
 */
class PatrocinadorPublicoController extends Controller
{
    public function __construct(
        private readonly PatrocinadorService $patrocinadorService,
        private readonly ConfiguracionPatrocinadoresService $configuracionService
    ) {
    }

    public function index(): AnonymousResourceCollection
    {
        return PatrocinadorResource::collection(
            $this->patrocinadorService->listarActivos()
        );
    }

    public function configuracion(): ConfiguracionPatrocinadoresResource
    {
        return new ConfiguracionPatrocinadoresResource(
            $this->configuracionService->obtener()
        );
    }
}
