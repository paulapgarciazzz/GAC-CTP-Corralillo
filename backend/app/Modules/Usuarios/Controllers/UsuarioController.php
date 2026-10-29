<?php

namespace App\Modules\Usuarios\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Usuarios\Requests\StoreUsuarioRequest;
use App\Modules\Usuarios\Requests\UpdateUsuarioRequest;
use App\Modules\Usuarios\Resources\UsuarioResource;
use App\Modules\Usuarios\Services\UsuarioService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class UsuarioController extends Controller
{
    public function __construct(
        private readonly UsuarioService $usuarioService
    ) {
    }

    /**
     * Lista usuarios paginados. Acepta ?buscar= por nombre o correo.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        return UsuarioResource::collection(
            $this->usuarioService->listar($request->string('buscar')->trim()->value() ?: null)
        );
    }

    /**
     * Crea un usuario.
     */
    public function store(StoreUsuarioRequest $request): JsonResponse
    {
        return (new UsuarioResource(
            $this->usuarioService->crear($request->validated(), $request->user())
        ))->response()->setStatusCode(201);
    }

    /**
     * Actualiza un usuario.
     */
    public function update(UpdateUsuarioRequest $request, User $usuario): UsuarioResource
    {
        return new UsuarioResource(
            $this->usuarioService->actualizar($usuario, $request->validated(), $request->user())
        );
    }

    /**
     * Elimina un usuario.
     */
    public function destroy(Request $request, User $usuario): JsonResponse
    {
        $this->usuarioService->eliminar($usuario, $request->user());

        return response()->json([
            'message' => 'Usuario eliminado correctamente.',
        ], 200);
    }
}
