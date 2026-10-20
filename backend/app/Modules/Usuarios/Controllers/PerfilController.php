<?php

namespace App\Modules\Usuarios\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Usuarios\Requests\ActualizarPerfilRequest;
use App\Modules\Usuarios\Resources\UsuarioResource;
use App\Modules\Usuarios\Services\UsuarioService;
use Illuminate\Http\JsonResponse;

class PerfilController extends Controller
{
    public function __construct(
        private readonly UsuarioService $usuarioService
    ) {
    }

    /**
     * Actualiza el perfil del usuario autenticado. Disponible para cualquier rol.
     * Responde con el usuario plano, igual que GET /user.
     */
    public function update(ActualizarPerfilRequest $request): JsonResponse
    {
        $usuario = $this->usuarioService->actualizarPerfil($request->user(), $request->validated());

        return response()->json((new UsuarioResource($usuario))->resolve($request));
    }
}
