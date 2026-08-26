<?php

namespace App\Modules\SolicitudesAgrupaciones\Controllers;

use App\Modules\SolicitudesAgrupaciones\Requests\GestionarSolicitudRequest;
use App\Modules\SolicitudesAgrupaciones\Requests\StoreSolicitudAgrupacionRequest;
use App\Modules\SolicitudesAgrupaciones\Resources\SolicitudAgrupacionResource;
use App\Modules\SolicitudesAgrupaciones\Services\SolicitudAgrupacionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class SolicitudAgrupacionController
{
    public function __construct(private SolicitudAgrupacionService $service) {}

    public function index(): AnonymousResourceCollection
    {
        return SolicitudAgrupacionResource::collection($this->service->listar());
    }

    public function show(int $id): SolicitudAgrupacionResource
    {
        return new SolicitudAgrupacionResource($this->service->buscarPorId($id));
    }

    public function store(
        StoreSolicitudAgrupacionRequest $request
    ): JsonResponse {
        return (new SolicitudAgrupacionResource(
            $this->service->crear($request->validated())
        ))->response()->setStatusCode(201);
    }

    public function aprobar(
        GestionarSolicitudRequest $request,
        int $id
    ): SolicitudAgrupacionResource {
        return new SolicitudAgrupacionResource(
            $this->service->aprobar($id, $request->validated())
        );
    }

    public function rechazar(int $id): SolicitudAgrupacionResource
    {
        return new SolicitudAgrupacionResource($this->service->rechazar($id));
    }
}