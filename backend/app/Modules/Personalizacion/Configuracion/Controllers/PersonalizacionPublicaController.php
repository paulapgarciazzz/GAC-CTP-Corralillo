<?php

namespace App\Modules\Personalizacion\Configuracion\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Personalizacion\Configuracion\Resources\FotoPersonalizacionResource;
use App\Modules\Personalizacion\Configuracion\Services\FotoPersonalizacionService;
use App\Modules\Personalizacion\Configuracion\Services\PersonalizacionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Endpoint público, de solo lectura, consumido por la landing y el panel
 * (escudo, logo y colores). Nunca expone los textos de los correos ni las
 * fotos inactivas.
 */
class PersonalizacionPublicaController extends Controller
{
    public function __construct(
        private readonly PersonalizacionService $personalizacionService,
        private readonly FotoPersonalizacionService $fotoService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $datos = $this->personalizacionService->publica();
        $fotos = fn (string $destino) => FotoPersonalizacionResource::collection(
            $this->fotoService->listarActivas($destino)
        )->resolve($request);

        $datos['fotos_hero'] = $fotos('hero');
        $datos['galeria'] = $datos['apariencia']['mostrar_galeria'] ? $fotos('galeria') : [];

        return response()->json(['data' => $datos]);
    }
}
