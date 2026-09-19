<?php

namespace App\Modules\Beneficios\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Beneficios\Models\Tarima;
use App\Modules\Beneficios\Requests\StoreTarimaRequest;
use App\Modules\Beneficios\Requests\UpdateTarimaRequest;
use App\Modules\Beneficios\Resources\TarimaResource;
use App\Modules\Beneficios\Services\TarimaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TarimaController extends Controller
{
    public function __construct(
        private readonly TarimaService $tarimaService
    ) {
    }

    public function index(): AnonymousResourceCollection
    {
        return TarimaResource::collection(
            $this->tarimaService->listar()
        );
    }

    public function show(int $id): TarimaResource
    {
        return new TarimaResource(
            $this->tarimaService->obtenerPorId($id)
        );
    }

    public function store(StoreTarimaRequest $request): JsonResponse
    {
        return (new TarimaResource(
            $this->tarimaService->crear($request->validated())
        ))->response()->setStatusCode(201);
    }

    public function update(
        UpdateTarimaRequest $request,
        Tarima $tarima
    ): TarimaResource {
        return new TarimaResource(
            $this->tarimaService->actualizar(
                $tarima,
                $request->validated()
            )
        );
    }

    public function destroy(Tarima $tarima): JsonResponse
    {
        $this->tarimaService->eliminar($tarima);

        return response()->json([
            'message' => 'Tarima eliminada correctamente.',
        ], 200);
    }
}