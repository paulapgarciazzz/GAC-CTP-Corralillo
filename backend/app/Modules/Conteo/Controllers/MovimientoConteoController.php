<?php

namespace App\Modules\Conteo\Controllers;

use App\Modules\Conteo\Requests\ListarMovimientoConteoRequest;
use App\Modules\Conteo\Requests\StoreMovimientoConteoRequest;
use App\Modules\Conteo\Resources\MovimientoConteoResource;
use App\Modules\Conteo\Services\MovimientoConteoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class MovimientoConteoController
{
    public function __construct(
        private readonly MovimientoConteoService $movimientoConteoService
    ) {
    }

    /**
     * Historial paginado de movimientos, con filtros opcionales por fecha
     * y tipo, del más reciente al más antiguo.
     */
    public function index(ListarMovimientoConteoRequest $request): AnonymousResourceCollection
    {
        return MovimientoConteoResource::collection(
            $this->movimientoConteoService->listar($request->validated())
        );
    }

    /**
     * Registra un movimiento reportado por el sensor autenticado.
     *
     * 201: movimiento nuevo. 200: reintento de un evento que ya estaba
     * registrado (el dispositivo debe tratarlo como éxito). 409: el
     * identificador pertenece a otro sensor.
     */
    public function store(StoreMovimientoConteoRequest $request): JsonResponse
    {
        $sensor = $request->attributes->get('sensor');

        ['movimiento' => $movimiento, 'creado' => $creado] = $this->movimientoConteoService->registrar(
            $sensor,
            $request->validated()['identificador_evento']
        );

        if ($movimiento->id_sensor !== $sensor->id_sensor) {
            return response()->json([
                'message' => 'El identificador del evento ya fue usado por otro sensor.',
            ], 409);
        }

        return (new MovimientoConteoResource($movimiento))
            ->additional(['duplicado' => ! $creado])
            ->response()
            ->setStatusCode($creado ? 201 : 200);
    }
}
