<?php

namespace App\Modules\Usuarios\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Usuarios\Requests\SincronizarPermisosRequest;
use App\Modules\Usuarios\Resources\UsuarioResource;
use App\Modules\Usuarios\Services\UsuarioService;
use App\Modules\Usuarios\Support\Modulos;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\ValidationException;

class PermisoUsuarioController extends Controller
{
    public function __construct(
        private readonly UsuarioService $usuarioService
    ) {
    }

    /**
     * Lista usuarios no administradores con sus permisos de módulo.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        return UsuarioResource::collection(
            $this->usuarioService->listarConPermisos($request->string('buscar')->trim()->value() ?: null)
        );
    }

    /**
     * Reemplaza los permisos de módulo de un usuario.
     */
    public function update(SincronizarPermisosRequest $request, User $usuario): UsuarioResource
    {
        if ($usuario->hasRole(Modulos::ROL_ADMIN)) {
            throw ValidationException::withMessages([
                'permisos' => 'Los administradores tienen acceso total; sus permisos no se editan.',
            ]);
        }

        return new UsuarioResource(
            $this->usuarioService->sincronizarPermisos($usuario, $request->validated('permisos'), $request->user())
        );
    }
}
