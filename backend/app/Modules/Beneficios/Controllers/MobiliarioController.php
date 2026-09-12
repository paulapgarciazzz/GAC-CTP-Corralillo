<?php

namespace App\Modules\Beneficios\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Beneficios\Models\Mobiliario;
use App\Modules\Beneficios\Requests\StoreMobiliarioRequest;
use App\Modules\Beneficios\Requests\UpdateMobiliarioRequest;
use App\Modules\Beneficios\Resources\MobiliarioResource;
use App\Modules\Beneficios\Services\MobiliarioService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class MobiliarioController extends Controller
{
    public function __construct(
        private readonly MobiliarioService $mobiliarioService
    ) {
    }

    public function index(): AnonymousResourceCollection
    {
        return MobiliarioResource::collection(
            $this->mobiliarioService->listar()
        );
    }

    public function show(int $id): MobiliarioResource
    {
        return new MobiliarioResource(
            $this->mobiliarioService->obtenerPorId($id)
        );
    }

    public function store(StoreMobiliarioRequest $request): JsonResponse
    {
        return (new MobiliarioResource(
            $this->mobiliarioService->crear($request->validated())
        ))->response()->setStatusCode(201);
    }

    public function update(
        UpdateMobiliarioRequest $request,
        Mobiliario $mobiliario
    ): MobiliarioResource {
        return new MobiliarioResource(
            $this->mobiliarioService->actualizar(
                $mobiliario,
                $request->validated()
            )
        );
    }

    public function destroy(Mobiliario $mobiliario): JsonResponse
    {
        $this->mobiliarioService->eliminar($mobiliario);

        return response()->json([
            'message' => 'Mobiliario eliminado correctamente.',
        ], 200);
    }
}