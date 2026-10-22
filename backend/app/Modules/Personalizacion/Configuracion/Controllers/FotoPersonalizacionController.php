<?php

namespace App\Modules\Personalizacion\Configuracion\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Personalizacion\Configuracion\Models\FotoPersonalizacion;
use App\Modules\Personalizacion\Configuracion\Requests\ReordenarFotosRequest;
use App\Modules\Personalizacion\Configuracion\Requests\StoreFotoRequest;
use App\Modules\Personalizacion\Configuracion\Requests\UpdateFotoRequest;
use App\Modules\Personalizacion\Configuracion\Resources\FotoPersonalizacionResource;
use App\Modules\Personalizacion\Configuracion\Services\FotoPersonalizacionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

class FotoPersonalizacionController extends Controller
{
    public function __construct(
        private readonly FotoPersonalizacionService $fotoService
    ) {
    }

    /**
     * Fotos de un destino (hero o galeria), incluidas las inactivas.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $destino = $request->validate([
            'destino' => ['required', 'string', Rule::in(FotoPersonalizacion::DESTINOS)],
        ])['destino'];

        return FotoPersonalizacionResource::collection($this->fotoService->listar($destino));
    }

    public function store(StoreFotoRequest $request): JsonResponse
    {
        $datos = $request->safe()->except('archivo');

        return (new FotoPersonalizacionResource(
            $this->fotoService->crear($datos, $request->file('archivo'))
        ))->response()->setStatusCode(201);
    }

    public function update(UpdateFotoRequest $request, FotoPersonalizacion $foto): FotoPersonalizacionResource
    {
        return new FotoPersonalizacionResource(
            $this->fotoService->actualizar($foto, $request->safe()->except('archivo'), $request->file('archivo'))
        );
    }

    public function destroy(FotoPersonalizacion $foto): JsonResponse
    {
        $this->fotoService->eliminar($foto);

        return response()->json(['message' => 'Foto eliminada correctamente.']);
    }

    public function reordenar(ReordenarFotosRequest $request): JsonResponse
    {
        $this->fotoService->reordenar($request->validated('fotos'));

        return response()->json(['message' => 'Orden actualizado correctamente.']);
    }
}
