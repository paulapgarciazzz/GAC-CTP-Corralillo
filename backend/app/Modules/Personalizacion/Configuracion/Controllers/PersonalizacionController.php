<?php

namespace App\Modules\Personalizacion\Configuracion\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Personalizacion\Configuracion\Requests\ActualizarSeccionRequest;
use App\Modules\Personalizacion\Configuracion\Requests\SubirImagenRequest;
use App\Modules\Personalizacion\Configuracion\Services\PersonalizacionService;
use App\Modules\Personalizacion\Configuracion\Support\Predeterminados;
use Illuminate\Http\JsonResponse;

/**
 * Secciones de Personalización del panel: landing, correos, apariencia y contacto.
 */
class PersonalizacionController extends Controller
{
    public function __construct(
        private readonly PersonalizacionService $personalizacionService
    ) {
    }

    public function show(string $seccion): JsonResponse
    {
        return response()->json([
            'data' => $this->personalizacionService->paraAdministracion($seccion),
        ]);
    }

    public function update(ActualizarSeccionRequest $request, string $seccion): JsonResponse
    {
        return response()->json([
            'data' => $this->personalizacionService->actualizar($seccion, $request->validated()),
        ]);
    }

    public function subirImagen(SubirImagenRequest $request, string $seccion, string $campo): JsonResponse
    {
        $this->validarImagen($seccion, $campo);

        return response()->json([
            'data' => $this->personalizacionService->guardarImagen($seccion, $campo, $request->file('imagen')),
        ]);
    }

    public function restaurarImagen(string $seccion, string $campo): JsonResponse
    {
        $this->validarImagen($seccion, $campo);

        return response()->json([
            'data' => $this->personalizacionService->restaurarImagen($seccion, $campo),
        ]);
    }

    private function validarImagen(string $seccion, string $campo): void
    {
        abort_unless(
            in_array($campo, Predeterminados::IMAGENES[$seccion] ?? [], true),
            404,
            'Imagen no encontrada.'
        );
    }
}
