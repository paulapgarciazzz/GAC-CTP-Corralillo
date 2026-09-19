<?php

namespace App\Modules\Beneficios\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Beneficios\Models\AsignacionBeneficios;
use App\Modules\Beneficios\Requests\StoreAsignacionBeneficiosRequest;
use App\Modules\Beneficios\Requests\UpdateAsignacionBeneficiosRequest;
use App\Modules\Beneficios\Resources\AsignacionBeneficiosResource;
use App\Modules\Beneficios\Services\AsignacionBeneficiosService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AsignacionBeneficiosController extends Controller
{
    public function __construct(
        private readonly AsignacionBeneficiosService $service
    ) {
    }

    public function index(): AnonymousResourceCollection
    {
        return AsignacionBeneficiosResource::collection(
            $this->service->listar()
        );
    }

    public function store(
        StoreAsignacionBeneficiosRequest $request
    ): JsonResponse {
        return (new AsignacionBeneficiosResource(
            $this->service->crear($request->validated())
        ))->response()->setStatusCode(201);
    }

    public function show(int $id): AsignacionBeneficiosResource
    {
        return new AsignacionBeneficiosResource(
            $this->service->obtenerPorId($id)
        );
    }

    public function update(
        UpdateAsignacionBeneficiosRequest $request,
        AsignacionBeneficios $asignacion
    ): AsignacionBeneficiosResource {
        return new AsignacionBeneficiosResource(
            $this->service->actualizar(
                $asignacion,
                $request->validated()
            )
        );
    }
}