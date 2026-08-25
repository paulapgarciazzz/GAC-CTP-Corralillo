<?php

namespace App\Modules\SolicitudesAgrupaciones\Controllers;

use App\Modules\SolicitudesAgrupaciones\Models\Agrupacion;
use App\Modules\SolicitudesAgrupaciones\Requests\StoreAgrupacionRequest;
use App\Modules\SolicitudesAgrupaciones\Requests\StoreParticipacionRequest;
use App\Modules\SolicitudesAgrupaciones\Requests\UpdateAgrupacionRequest;
use App\Modules\SolicitudesAgrupaciones\Resources\AgrupacionResource;
use App\Modules\SolicitudesAgrupaciones\Resources\ParticipacionResource;
use App\Modules\SolicitudesAgrupaciones\Services\AgrupacionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AgrupacionController
{
    public function __construct(private AgrupacionService $service) {}

    public function index(string $cedula): AnonymousResourceCollection
    {
        return AgrupacionResource::collection(
            $this->service->obtenerPorEncargado($cedula)
        );
    }

    public function store(StoreAgrupacionRequest $request): JsonResponse
    {
        return (new AgrupacionResource(
            $this->service->crear($request->validated())->load('participaciones')
        ))->response()->setStatusCode(201);
    }

    public function show(Agrupacion $agrupacion): AgrupacionResource
    {
        return new AgrupacionResource(
            $agrupacion->load(['encargado', 'participaciones'])
        );
    }

    public function update(
        UpdateAgrupacionRequest $request,
        Agrupacion $agrupacion
    ): AgrupacionResource {
        return new AgrupacionResource(
            $this->service->actualizar($agrupacion, $request->validated())
                ->load(['encargado', 'participaciones'])
        );
    }

    public function participaciones(
        StoreParticipacionRequest $request,
        Agrupacion $agrupacion
    ): JsonResponse {
        return (new ParticipacionResource(
            $this->service->agregarParticipacion(
                $agrupacion,
                $request->validated()
            )
        ))->response()->setStatusCode(201);
    }
}