<?php

namespace App\Modules\SolicitudesAgrupaciones\Controllers;

use App\Modules\SolicitudesAgrupaciones\Models\Agrupacion;
use App\Modules\SolicitudesAgrupaciones\Requests\StoreAgrupacionRequest;
use App\Modules\SolicitudesAgrupaciones\Requests\StoreParticipacionRequest;
use App\Modules\SolicitudesAgrupaciones\Requests\UpdateAgrupacionRequest;
use App\Modules\SolicitudesAgrupaciones\Resources\AgrupacionResource;
use App\Modules\SolicitudesAgrupaciones\Resources\ParticipacionResource;
use App\Modules\SolicitudesAgrupaciones\Services\AgrupacionService;
use App\Modules\SolicitudesAgrupaciones\Support\DataUri;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class AgrupacionController
{
    public function __construct(private AgrupacionService $service) {}

    public function index(string $cedula): AnonymousResourceCollection
    {
        return AgrupacionResource::collection(
            $this->service->obtenerPorEncargado($cedula)
        );
    }

    public function listar(): AnonymousResourceCollection
    {
        return AgrupacionResource::collection(
            $this->service->listarAprobadas()
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

    public function archivoAdjunto(Agrupacion $agrupacion): Response
    {
        $archivo = $this->service->obtenerArchivoAdjunto($agrupacion);
        $extension = DataUri::extensionParaMime($archivo['mime']);

        return response($archivo['binario'], 200, [
            'Content-Type' => $archivo['mime'],
            'Content-Disposition' => "inline; filename=\"agrupacion-{$agrupacion->id}.{$extension}\"",
            'Cache-Control' => 'private, max-age=3600',
        ]);
    }

    public function destroy(Agrupacion $agrupacion): Response
    {
        $this->service->eliminar($agrupacion);

        return response()->noContent();
    }
}