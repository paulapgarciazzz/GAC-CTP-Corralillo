<?php

namespace App\Modules\Calendario\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Calendario\Models\Ubicacion;
use App\Modules\Calendario\Requests\StoreUbicacionRequest;
use App\Modules\Calendario\Requests\UpdateUbicacionRequest;
use App\Modules\Calendario\Resources\UbicacionResource;
use App\Modules\Calendario\Services\UbicacionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class UbicacionController extends Controller
{
    public function __construct(
        private readonly UbicacionService $ubicacionService
    ) {
    }

    /**
     * Lista todas las ubicaciones.
     */
    public function index(): AnonymousResourceCollection
    {
        return UbicacionResource::collection(
            $this->ubicacionService->listar()
        );
    }

    /**
     * Muestra una ubicación por su ID.
     */
    public function show(int $ubicacion): UbicacionResource
    {
        return new UbicacionResource(
            $this->ubicacionService->obtenerPorId($ubicacion)
        );
    }

    /**
     * Crea una nueva ubicación.
     */
    public function store(StoreUbicacionRequest $request): JsonResponse
    {
        return (new UbicacionResource(
            $this->ubicacionService->crear($request->validated())
        ))->response()->setStatusCode(201);
    }

    /**
     * Actualiza una ubicación existente.
     */
    public function update(
        UpdateUbicacionRequest $request,
        Ubicacion $ubicacion
    ): UbicacionResource {
        return new UbicacionResource(
            $this->ubicacionService->actualizar(
                $ubicacion,
                $request->validated()
            )
        );
    }

    /**
     * Elimina una ubicación.
     */
    public function destroy(Ubicacion $ubicacion): JsonResponse
    {
        $this->ubicacionService->eliminar($ubicacion);

        return response()->json([
            'message' => 'Ubicación eliminada correctamente.',
        ], 200);
    }
}
