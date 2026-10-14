<?php

namespace App\Modules\Beneficios\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Beneficios\Models\Aula;
use App\Modules\Beneficios\Requests\StoreAulaRequest;
use App\Modules\Beneficios\Requests\UpdateAulaRequest;
use App\Modules\Beneficios\Resources\AulaResource;
use App\Modules\Beneficios\Services\AulaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AulaController extends Controller
{
    public function __construct(
        private readonly AulaService $aulaService
    ) {
    }

    /**
     * Lista todas las aulas.
     */
    public function index(): AnonymousResourceCollection
    {
        return AulaResource::collection(
            $this->aulaService->listar()
        );
    }

    /**
     * Muestra un aula por su ID.
     */
    public function show(int $id): AulaResource
    {
        return new AulaResource(
            $this->aulaService->obtenerPorId($id)
        );
    }

    /**
     * Crea una nueva aula.
     */
    public function store(StoreAulaRequest $request): JsonResponse
    {
        return (new AulaResource(
            $this->aulaService->crear($request->validated())
        ))->response()->setStatusCode(201);
    }

    /**
     * Actualiza un aula existente.
     */
    public function update(
        UpdateAulaRequest $request,
        Aula $aula
    ): AulaResource {
        return new AulaResource(
            $this->aulaService->actualizar(
                $aula,
                $request->validated()
            )
        );
    }

    /**
     * Elimina un aula.
     */
    public function destroy(Aula $aula): JsonResponse
    {
        $this->aulaService->eliminar($aula);

        return response()->json([
            'message' => 'Aula eliminada correctamente.',
        ], 200);
    }
}