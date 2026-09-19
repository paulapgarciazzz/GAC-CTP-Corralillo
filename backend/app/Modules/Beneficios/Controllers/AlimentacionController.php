<?php

namespace App\Modules\Beneficios\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Beneficios\Models\Alimentacion;
use App\Modules\Beneficios\Requests\StoreAlimentacionRequest;
use App\Modules\Beneficios\Requests\UpdateAlimentacionRequest;
use App\Modules\Beneficios\Resources\AlimentacionResource;
use App\Modules\Beneficios\Services\AlimentacionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AlimentacionController extends Controller
{
    public function __construct(
        private readonly AlimentacionService $alimentacionService
    ) {
    }

    /**
     * Lista todos los tipos de alimentación.
     */
    public function index(): AnonymousResourceCollection
    {
        return AlimentacionResource::collection(
            $this->alimentacionService->listar()
        );
    }

    /**
     * Muestra un tipo de alimentación.
     */
    public function show(int $id): AlimentacionResource
    {
        return new AlimentacionResource(
            $this->alimentacionService->obtenerPorId($id)
        );
    }

    /**
     * Crea un nuevo tipo de alimentación.
     */
    public function store(StoreAlimentacionRequest $request): JsonResponse
    {
        return (new AlimentacionResource(
            $this->alimentacionService->crear($request->validated())
        ))->response()->setStatusCode(201);
    }

    /**
     * Actualiza un tipo de alimentación.
     */
    public function update(
        UpdateAlimentacionRequest $request,
        Alimentacion $alimentacion
    ): AlimentacionResource {
        return new AlimentacionResource(
            $this->alimentacionService->actualizar(
                $alimentacion,
                $request->validated()
            )
        );
    }

    /**
     * Elimina un tipo de alimentación.
     */
    public function destroy(Alimentacion $alimentacion): JsonResponse
    {
        $this->alimentacionService->eliminar($alimentacion);

        return response()->json([
            'message' => 'Alimentación eliminada correctamente.',
        ], 200);
    }
}