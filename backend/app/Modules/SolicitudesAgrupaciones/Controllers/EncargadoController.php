<?php

namespace App\Modules\SolicitudesAgrupaciones\Controllers;

use App\Modules\SolicitudesAgrupaciones\Models\Encargado;
use App\Modules\SolicitudesAgrupaciones\Requests\StoreEncargadoRequest;
use App\Modules\SolicitudesAgrupaciones\Requests\UpdateEncargadoRequest;
use App\Modules\SolicitudesAgrupaciones\Resources\EncargadoResource;
use App\Modules\SolicitudesAgrupaciones\Services\EncargadoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class EncargadoController
{
    public function __construct(private EncargadoService $service) {}

    public function index(): AnonymousResourceCollection
    {
        return EncargadoResource::collection(
            $this->service->listarAdministrativa()
        );
    }

    public function show(string $cedula): EncargadoResource
    {
        $encargado = $this->service->buscarPorCedula($cedula);

        abort_if($encargado === null, 404, 'Encargado no encontrado.');

        return new EncargadoResource($encargado->load('agrupaciones'));
    }

    public function store(StoreEncargadoRequest $request): JsonResponse
    {
        return (new EncargadoResource(
            $this->service->crear($request->validated())
        ))->response()->setStatusCode(201);
    }

    public function update(UpdateEncargadoRequest $request, string $cedula): EncargadoResource
    {
        $encargado = $this->service->buscarPorCedula($cedula);

        abort_if($encargado === null, 404, 'Encargado no encontrado.');

        return new EncargadoResource(
            $this->service->actualizar($encargado, $request->validated())
        );
    }

    public function destroy(string $cedula): Response
    {
        $encargado = $this->service->buscarPorCedula($cedula);

        abort_if($encargado === null, 404, 'Encargado no encontrado.');

        $this->service->eliminar($encargado);

        return response()->noContent();
    }
}