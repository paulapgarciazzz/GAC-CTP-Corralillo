<?php

namespace App\Modules\Personalizacion\Patrocinadores\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Personalizacion\Patrocinadores\Requests\UpdateConfiguracionPatrocinadoresRequest;
use App\Modules\Personalizacion\Patrocinadores\Resources\ConfiguracionPatrocinadoresResource;
use App\Modules\Personalizacion\Patrocinadores\Services\ConfiguracionPatrocinadoresService;

class ConfiguracionPatrocinadoresController extends Controller
{
    public function __construct(
        private readonly ConfiguracionPatrocinadoresService $configuracionService
    ) {
    }

    public function show(): ConfiguracionPatrocinadoresResource
    {
        return new ConfiguracionPatrocinadoresResource(
            $this->configuracionService->obtener()
        );
    }

    public function update(
        UpdateConfiguracionPatrocinadoresRequest $request
    ): ConfiguracionPatrocinadoresResource {
        return new ConfiguracionPatrocinadoresResource(
            $this->configuracionService->actualizar($request->validated())
        );
    }
}
