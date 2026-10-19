<?php

namespace App\Modules\Personalizacion\Patrocinadores\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Personalizacion\Patrocinadores\Models\Patrocinador;
use App\Modules\Personalizacion\Patrocinadores\Requests\ReordenarPatrocinadoresRequest;
use App\Modules\Personalizacion\Patrocinadores\Requests\StorePatrocinadorRequest;
use App\Modules\Personalizacion\Patrocinadores\Requests\UpdatePatrocinadorRequest;
use App\Modules\Personalizacion\Patrocinadores\Resources\PatrocinadorResource;
use App\Modules\Personalizacion\Patrocinadores\Services\PatrocinadorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PatrocinadorController extends Controller
{
    public function __construct(
        private readonly PatrocinadorService $patrocinadorService
    ) {
    }

    /**
     * Lista todos los patrocinadores (vista administrativa, incluye inactivos).
     */
    public function index(): AnonymousResourceCollection
    {
        return PatrocinadorResource::collection(
            $this->patrocinadorService->listar()
        );
    }

    /**
     * Muestra un patrocinador por su ID.
     */
    public function show(Patrocinador $patrocinador): PatrocinadorResource
    {
        return new PatrocinadorResource($patrocinador);
    }

    /**
     * Crea un nuevo patrocinador.
     */
    public function store(StorePatrocinadorRequest $request): JsonResponse
    {
        $datos = $request->validated();
        $logotipo = $request->file('logotipo');

        unset($datos['logotipo']);

        return (new PatrocinadorResource(
            $this->patrocinadorService->crear($datos, $logotipo)
        ))->response()->setStatusCode(201);
    }

    /**
     * Actualiza un patrocinador existente.
     */
    public function update(
        UpdatePatrocinadorRequest $request,
        Patrocinador $patrocinador
    ): PatrocinadorResource {
        $datos = $request->validated();
        $logotipo = $request->file('logotipo');

        unset($datos['logotipo']);

        return new PatrocinadorResource(
            $this->patrocinadorService->actualizar($patrocinador, $datos, $logotipo)
        );
    }

    /**
     * Elimina un patrocinador.
     */
    public function destroy(Patrocinador $patrocinador): JsonResponse
    {
        $this->patrocinadorService->eliminar($patrocinador);

        return response()->json([
            'message' => 'Patrocinador eliminado correctamente.',
        ], 200);
    }

    /**
     * Aplica un nuevo orden a un lote de patrocinadores (drag and drop).
     */
    public function reordenar(ReordenarPatrocinadoresRequest $request): JsonResponse
    {
        $this->patrocinadorService->reordenar($request->validated('patrocinadores'));

        return response()->json([
            'message' => 'Orden actualizado correctamente.',
        ], 200);
    }
}
