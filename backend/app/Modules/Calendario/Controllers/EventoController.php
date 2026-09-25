<?php

namespace App\Modules\Calendario\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Calendario\Models\Evento;
use App\Modules\Calendario\Requests\StoreEventoRequest;
use App\Modules\Calendario\Requests\UpdateEventoRequest;
use App\Modules\Calendario\Resources\EventoResource;
use App\Modules\Calendario\Services\EventoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class EventoController extends Controller
{
    public function __construct(
        private readonly EventoService $eventoService
    ) {
    }

    /**
     * Lista todos los eventos.
     */
    public function index(): AnonymousResourceCollection
    {
        return EventoResource::collection(
            $this->eventoService->listar()
        );
    }

    /**
     * Muestra un evento por su ID.
     */
    public function show(int $id): EventoResource
    {
        return new EventoResource(
            $this->eventoService->obtenerPorId($id)
        );
    }

    /**
     * Crea un nuevo evento.
     */
    public function store(StoreEventoRequest $request): JsonResponse
    {
        return (new EventoResource(
            $this->eventoService->crear($request->validated())
        ))->response()->setStatusCode(201);
    }

    /**
     * Actualiza un evento existente.
     */
    public function update(
        UpdateEventoRequest $request,
        Evento $evento
    ): EventoResource {
        return new EventoResource(
            $this->eventoService->actualizar(
                $evento,
                $request->validated()
            )
        );
    }

    /**
     * Elimina un evento.
     */
    public function destroy(Evento $evento): JsonResponse
    {
        $this->eventoService->eliminar($evento);

        return response()->json([
            'message' => 'Evento eliminado correctamente.',
        ], 200);
    }
}
