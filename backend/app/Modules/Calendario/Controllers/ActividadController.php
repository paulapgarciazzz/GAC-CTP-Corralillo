<?php

namespace App\Modules\Calendario\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Calendario\Models\Actividad;
use App\Modules\Calendario\Models\Evento;
use App\Modules\Calendario\Requests\DuplicarActividadRequest;
use App\Modules\Calendario\Requests\StoreActividadRequest;
use App\Modules\Calendario\Requests\UpdateActividadRequest;
use App\Modules\Calendario\Resources\ActividadResource;
use App\Modules\Calendario\Resources\EstadoActividadResource;
use App\Modules\Calendario\Services\ActividadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ActividadController extends Controller
{
    public function __construct(
        private readonly ActividadService $actividadService
    ) {
    }

    /**
     * Lista todas las actividades.
     */
    public function index(): AnonymousResourceCollection
    {
        return ActividadResource::collection(
            $this->actividadService->listar()
        );
    }

    /**
     * Lista las actividades de un evento.
     */
    public function porEvento(Evento $evento): AnonymousResourceCollection
    {
        return ActividadResource::collection(
            $this->actividadService->listarPorEvento($evento)
        );
    }

    /**
     * Muestra una actividad por su ID.
     */
    public function show(int $actividad): ActividadResource
    {
        return new ActividadResource(
            $this->actividadService->obtenerPorId($actividad)
        );
    }

    /**
     * Crea una nueva actividad.
     */
    public function store(StoreActividadRequest $request): JsonResponse
    {
        return (new ActividadResource(
            $this->actividadService->crear($request->validated())
        ))->response()->setStatusCode(201);
    }

    /**
     * Actualiza una actividad existente.
     */
    public function update(
        UpdateActividadRequest $request,
        Actividad $actividad
    ): ActividadResource {
        return new ActividadResource(
            $this->actividadService->actualizar(
                $actividad,
                $request->validated()
            )
        );
    }

    /**
     * Duplica una actividad hacia un evento.
     */
    public function duplicar(
        DuplicarActividadRequest $request,
        Actividad $actividad
    ): JsonResponse {
        return (new ActividadResource(
            $this->actividadService->duplicar(
                $actividad,
                $request->validated()
            )
        ))->response()->setStatusCode(201);
    }

    /**
     * Elimina una actividad.
     */
    public function destroy(Actividad $actividad): JsonResponse
    {
        $this->actividadService->eliminar($actividad);

        return response()->json([
            'message' => 'Actividad eliminada correctamente.',
        ], 200);
    }

    /**
     * Lista las agrupaciones con solicitud aprobada para un evento.
     */
    public function agrupacionesAprobadas(Evento $evento): JsonResponse
    {
        return response()->json([
            'data' => $this->actividadService->listarAgrupacionesAprobadas($evento),
        ]);
    }

    /**
     * Lista el catálogo de estados de actividad.
     */
    public function estados(): AnonymousResourceCollection
    {
        return EstadoActividadResource::collection(
            $this->actividadService->listarEstados()
        );
    }
}
