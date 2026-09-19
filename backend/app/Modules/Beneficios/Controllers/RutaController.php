<?php

namespace App\Modules\Beneficios\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Beneficios\Models\Ruta;
use App\Modules\Beneficios\Requests\StoreRutaRequest;
use App\Modules\Beneficios\Requests\UpdateRutaRequest;
use App\Modules\Beneficios\Resources\RutaResource;
use App\Modules\Beneficios\Services\RutaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class RutaController extends Controller
{
    public function __construct(
        private readonly RutaService $rutaService
    ) {
    }

    public function index(): AnonymousResourceCollection
    {
        return RutaResource::collection(
            $this->rutaService->listar()
        );
    }

    public function show(int $id): RutaResource
    {
        return new RutaResource(
            $this->rutaService->obtenerPorId($id)
        );
    }

    public function store(StoreRutaRequest $request): JsonResponse
    {
        return (new RutaResource(
            $this->rutaService->crear($request->validated())
        ))->response()->setStatusCode(201);
    }

    public function update(
        UpdateRutaRequest $request,
        Ruta $ruta
    ): RutaResource {
        return new RutaResource(
            $this->rutaService->actualizar(
                $ruta,
                $request->validated()
            )
        );
    }

    public function destroy(Ruta $ruta): JsonResponse
    {
        $this->rutaService->eliminar($ruta);

        return response()->json([
            'message' => 'Ruta eliminada correctamente.',
        ], 200);
    }
}