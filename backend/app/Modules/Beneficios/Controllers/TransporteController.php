<?php

namespace App\Modules\Beneficios\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Beneficios\Models\Transporte;
use App\Modules\Beneficios\Requests\StoreTransporteRequest;
use App\Modules\Beneficios\Requests\UpdateTransporteRequest;
use App\Modules\Beneficios\Resources\TransporteResource;
use App\Modules\Beneficios\Services\TransporteService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TransporteController extends Controller
{
    public function __construct(
        private readonly TransporteService $transporteService
    ) {
    }

    public function index(): AnonymousResourceCollection
    {
        return TransporteResource::collection(
            $this->transporteService->listar()
        );
    }

    public function show(string $matricula): TransporteResource
    {
        return new TransporteResource(
            $this->transporteService->obtenerPorMatricula($matricula)
        );
    }

    public function store(StoreTransporteRequest $request): JsonResponse
    {
        return (new TransporteResource(
            $this->transporteService->crear($request->validated())
        ))->response()->setStatusCode(201);
    }

    public function update(
        UpdateTransporteRequest $request,
        Transporte $transporte
    ): TransporteResource {
        return new TransporteResource(
            $this->transporteService->actualizar(
                $transporte,
                $request->validated()
            )
        );
    }

    public function destroy(Transporte $transporte): JsonResponse
    {
        $this->transporteService->eliminar($transporte);

        return response()->json([
            'message' => 'Transporte eliminado correctamente.',
        ], 200);
    }
}