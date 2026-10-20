<?php

namespace App\Modules\Usuarios\Services;

use App\Models\User;
use App\Modules\Usuarios\Support\Modulos;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class UsuarioService
{
    /**
     * Lista usuarios paginados, filtrando por nombre o correo.
     */
    public function listar(?string $buscar, int $porPagina = 15): LengthAwarePaginator
    {
        return $this->consultaBase($buscar)->paginate($porPagina);
    }

    /**
     * Lista usuarios no administradores con sus permisos (vista Roles y Permisos).
     */
    public function listarConPermisos(?string $buscar, int $porPagina = 12): LengthAwarePaginator
    {
        return $this->consultaBase($buscar)
            ->whereDoesntHave('roles', fn (Builder $q) => $q->where('name', Modulos::ROL_ADMIN))
            ->paginate($porPagina);
    }

    /**
     * Crea un usuario y le asigna (o no) el rol administrador.
     */
    public function crear(array $datos): User
    {
        return DB::transaction(function () use ($datos) {
            $esAdmin = (bool) ($datos['es_admin'] ?? false);
            unset($datos['es_admin']);

            $usuario = User::create($datos);
            $usuario->syncRoles($esAdmin ? [Modulos::ROL_ADMIN] : []);

            return $usuario->refresh()->load(['roles', 'permissions']);
        });
    }

    /**
     * Actualiza un usuario. Impide que el usuario autenticado se desactive o se quite
     * el rol administrador, y que el sistema quede sin administradores.
     */
    public function actualizar(User $usuario, array $datos, User $actor): User
    {
        $esActor = $usuario->is($actor);
        $eraAdmin = $usuario->hasRole(Modulos::ROL_ADMIN);

        if ($esActor && array_key_exists('activo', $datos) && ! $datos['activo']) {
            throw ValidationException::withMessages(['activo' => 'No puede desactivar su propio usuario.']);
        }

        if (array_key_exists('es_admin', $datos) && $eraAdmin && ! $datos['es_admin']) {
            if ($esActor) {
                throw ValidationException::withMessages(['es_admin' => 'No puede quitarse el rol de administrador.']);
            }
            $this->asegurarQueQuedeOtroAdmin($usuario);
        }

        if (empty($datos['password'])) {
            unset($datos['password']);
        }

        return DB::transaction(function () use ($usuario, $datos) {
            if (array_key_exists('es_admin', $datos)) {
                $usuario->syncRoles($datos['es_admin'] ? [Modulos::ROL_ADMIN] : []);
                unset($datos['es_admin']);
            }

            $usuario->update($datos);

            if (! $usuario->activo) {
                $usuario->tokens()->delete();
            }

            return $usuario->refresh()->load(['roles', 'permissions']);
        });
    }

    /**
     * Elimina un usuario y sus tokens.
     */
    public function eliminar(User $usuario, User $actor): void
    {
        if ($usuario->is($actor)) {
            throw ValidationException::withMessages(['usuario' => 'No puede eliminar su propio usuario.']);
        }

        if ($usuario->hasRole(Modulos::ROL_ADMIN)) {
            $this->asegurarQueQuedeOtroAdmin($usuario);
        }

        DB::transaction(function () use ($usuario) {
            $usuario->tokens()->delete();
            $usuario->delete();
        });
    }

    /**
     * Reemplaza los permisos de módulo de un usuario. Cada módulo con alguna
     * acción conserva siempre "ver", que es la base para cargar sus datos.
     *
     * @param  array<int, string>  $permisos
     */
    public function sincronizarPermisos(User $usuario, array $permisos): User
    {
        $usuario->syncPermissions(Modulos::conAccionBase($permisos));

        return $usuario->load(['roles', 'permissions']);
    }

    /**
     * Actualiza los datos propios del usuario autenticado (nombre, correo, foto y
     * contraseña). Cambiar la contraseña exige la contraseña actual.
     */
    public function actualizarPerfil(User $usuario, array $datos): User
    {
        if (! empty($datos['password']) && ! Hash::check($datos['password_actual'] ?? '', $usuario->password)) {
            throw ValidationException::withMessages(['password_actual' => 'La contraseña actual no es correcta.']);
        }

        unset($datos['password_actual']);

        if (empty($datos['password'])) {
            unset($datos['password']);
        }

        $usuario->update($datos);

        return $usuario->refresh()->load(['roles', 'permissions']);
    }

    private function consultaBase(?string $buscar): Builder
    {
        return User::query()
            ->with(['roles', 'permissions'])
            ->when($buscar, function (Builder $q, string $buscar) {
                $q->where(function (Builder $q) use ($buscar) {
                    $q->where('name', 'like', "%{$buscar}%")
                        ->orWhere('email', 'like', "%{$buscar}%");
                });
            })
            ->orderBy('name');
    }

    private function asegurarQueQuedeOtroAdmin(User $usuario): void
    {
        $otrosAdmins = User::role(Modulos::ROL_ADMIN)
            ->whereKeyNot($usuario->getKey())
            ->count();

        if ($otrosAdmins === 0) {
            throw ValidationException::withMessages(['es_admin' => 'Debe existir al menos un administrador.']);
        }
    }
}
