<?php

namespace App\Modules\Usuarios\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Usuarios\Requests\EnviarCodigoRecuperacionRequest;
use App\Modules\Usuarios\Requests\RestablecerPasswordRequest;
use App\Modules\Usuarios\Services\RecuperacionPasswordService;
use Illuminate\Http\JsonResponse;

class RecuperacionPasswordController extends Controller
{
    public function __construct(private readonly RecuperacionPasswordService $servicio) {}

    /**
     * Envía el código de recuperación. La respuesta es la misma exista o no el correo.
     */
    public function enviarCodigo(EnviarCodigoRecuperacionRequest $request): JsonResponse
    {
        $this->servicio->enviarCodigo($request->validated('email'));

        return response()->json(['message' => 'Si el correo está registrado, te enviamos un código de verificación.']);
    }

    /**
     * Cambia la contraseña con el código recibido por correo.
     */
    public function restablecer(RestablecerPasswordRequest $request): JsonResponse
    {
        $this->servicio->restablecer(
            $request->validated('email'),
            (string) $request->validated('codigo'),
            $request->validated('password'),
        );

        return response()->json(['message' => 'Tu contraseña se actualizó correctamente.']);
    }
}
