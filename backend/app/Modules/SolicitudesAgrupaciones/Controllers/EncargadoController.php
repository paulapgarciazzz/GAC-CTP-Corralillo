<?php

namespace App\Modules\SolicitudesAgrupaciones\Controllers;

use App\Modules\SolicitudesAgrupaciones\Requests\StoreEncargadoRequest;
use App\Modules\SolicitudesAgrupaciones\Resources\EncargadoResource;
use App\Modules\SolicitudesAgrupaciones\Services\EncargadoService;
use Illuminate\Http\JsonResponse;

class EncargadoController
{
    public function __construct(private EncargadoService $service) {}

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
}