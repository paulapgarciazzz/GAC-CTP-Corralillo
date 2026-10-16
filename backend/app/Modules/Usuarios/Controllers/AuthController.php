<?php

namespace App\Modules\Usuarios\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Usuarios\Requests\LoginRequest;
use App\Modules\Usuarios\Resources\UsuarioResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\PersonalAccessToken;

class AuthController extends Controller
{
    /**
     * Valida credenciales y devuelve un token de acceso junto con el usuario.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $usuario = User::where('email', $request->validated('email'))->first();

        if (! $usuario || ! Hash::check($request->validated('password'), $usuario->password)) {
            throw ValidationException::withMessages(['email' => 'Credenciales incorrectas.']);
        }

        if (! $usuario->activo) {
            throw ValidationException::withMessages(['email' => 'El usuario está desactivado.']);
        }

        return response()->json([
            'token' => $usuario->createToken('spa')->plainTextToken,
            'user' => $this->serializar($usuario, $request),
        ]);
    }

    /**
     * Revoca el token actual.
     */
    public function logout(Request $request): JsonResponse
    {
        $token = $request->user()?->currentAccessToken();

        if ($token instanceof PersonalAccessToken) {
            $token->delete();
        }

        return response()->json(['message' => 'Sesión cerrada.']);
    }

    /**
     * Devuelve el usuario autenticado con sus roles y permisos.
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json($this->serializar($request->user(), $request));
    }

    private function serializar(User $usuario, Request $request): array
    {
        return (new UsuarioResource($usuario->load(['roles', 'permissions'])))->resolve($request);
    }
}
