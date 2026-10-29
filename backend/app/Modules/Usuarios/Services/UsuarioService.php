<?php

namespace App\Modules\Usuarios\Services;

use App\Models\User;
use App\Modules\Usuarios\Support\Modulos;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\PersonalAccessToken;

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
     * Crea un usuario y le asigna (o no) el rol administrador. Solo un
     * administrador puede crear otro administrador.
     */
    public function crear(array $datos, User $actor): User
    {
        $esAdmin = (bool) ($datos['es_admin'] ?? false);
        unset($datos['es_admin']);

        if ($esAdmin && ! $this->esAdmin($actor)) {
            throw ValidationException::withMessages(['es_admin' => 'Solo un administrador puede asignar el rol de administrador.']);
        }

        return DB::transaction(function () use ($datos, $esAdmin) {
            $usuario = User::create($datos);
            $usuario->syncRoles($esAdmin ? [Modulos::ROL_ADMIN] : []);

            return $usuario->refresh()->load(['roles', 'permissions']);
        });
    }

    /**
     * Actualiza un usuario. Solo un administrador puede modificar a otro
     * administrador u otorgar/quitar el rol. Impide que el usuario autenticado se
     * desactive o se quite el rol, y que el sistema quede sin administradores
     * activos. Desactivar o cambiar la contraseña cierra sus sesiones.
     */
    public function actualizar(User $usuario, array $datos, User $actor): User
    {
        $esActor = $usuario->is($actor);
        $eraAdmin = $usuario->hasRole(Modulos::ROL_ADMIN);
        $cambiaRol = array_key_exists('es_admin', $datos) && (bool) $datos['es_admin'] !== $eraAdmin;

        if ($eraAdmin && ! $this->esAdmin($actor)) {
            throw ValidationException::withMessages(['usuario' => 'Solo un administrador puede modificar la cuenta de un administrador.']);
        }

        if ($cambiaRol && ! $this->esAdmin($actor)) {
            throw ValidationException::withMessages(['es_admin' => 'Solo un administrador puede asignar o quitar el rol de administrador.']);
        }

        if ($esActor && array_key_exists('activo', $datos) && ! $datos['activo']) {
            throw ValidationException::withMessages(['activo' => 'No puede desactivar su propio usuario.']);
        }

        $quitaRol = $cambiaRol && $eraAdmin;

        if ($esActor && $quitaRol) {
            throw ValidationException::withMessages(['es_admin' => 'No puede quitarse el rol de administrador.']);
        }

        $desactiva = array_key_exists('activo', $datos) && ! $datos['activo'];
        $cambiaPassword = ! empty($datos['password']);

        if (! $cambiaPassword) {
            unset($datos['password']);
        }

        return DB::transaction(function () use ($usuario, $datos, $eraAdmin, $quitaRol, $desactiva, $cambiaPassword) {
            if ($eraAdmin && $usuario->activo && ($quitaRol || $desactiva)) {
                $this->asegurarQueQuedeOtroAdmin($usuario, $quitaRol ? 'es_admin' : 'activo');
            }

            if (array_key_exists('es_admin', $datos)) {
                $usuario->syncRoles($datos['es_admin'] ? [Modulos::ROL_ADMIN] : []);
                unset($datos['es_admin']);
            }

            $usuario->update($datos);

            if (! $usuario->activo || $cambiaPassword) {
                $usuario->tokens()->delete();
            }

            return $usuario->refresh()->load(['roles', 'permissions']);
        });
    }

    /**
     * Elimina un usuario y sus tokens. Solo un administrador puede eliminar a
     * otro administrador.
     */
    public function eliminar(User $usuario, User $actor): void
    {
        if ($usuario->is($actor)) {
            throw ValidationException::withMessages(['usuario' => 'No puede eliminar su propio usuario.']);
        }

        $esAdmin = $usuario->hasRole(Modulos::ROL_ADMIN);

        if ($esAdmin && ! $this->esAdmin($actor)) {
            throw ValidationException::withMessages(['usuario' => 'Solo un administrador puede eliminar a otro administrador.']);
        }

        DB::transaction(function () use ($usuario, $esAdmin) {
            if ($esAdmin && $usuario->activo) {
                $this->asegurarQueQuedeOtroAdmin($usuario, 'usuario');
            }

            $usuario->tokens()->delete();
            $usuario->delete();
        });
    }

    /**
     * Reemplaza los permisos de módulo de un usuario. Cada módulo con alguna
     * acción conserva siempre "ver", que es la base para cargar sus datos.
     * Nadie puede modificar sus propios permisos.
     *
     * @param  array<int, string>  $permisos
     */
    public function sincronizarPermisos(User $usuario, array $permisos, User $actor): User
    {
        if ($usuario->is($actor)) {
            throw ValidationException::withMessages(['permisos' => 'No puede modificar sus propios permisos.']);
        }

        $usuario->syncPermissions(Modulos::conAccionBase($permisos));

        return $usuario->load(['roles', 'permissions']);
    }

    /**
     * Actualiza los datos propios del usuario autenticado (nombre, correo, foto y
     * contraseña). Cambiar la contraseña exige la contraseña actual y cierra las
     * demás sesiones; la sesión desde la que se hizo el cambio se conserva.
     */
    public function actualizarPerfil(User $usuario, array $datos): User
    {
        $cambiaPassword = ! empty($datos['password']);

        if ($cambiaPassword && ! Hash::check($datos['password_actual'] ?? '', $usuario->password)) {
            throw ValidationException::withMessages(['password_actual' => 'La contraseña actual no es correcta.']);
        }

        unset($datos['password_actual']);

        if (! $cambiaPassword) {
            unset($datos['password']);
        }

        return DB::transaction(function () use ($usuario, $datos, $cambiaPassword) {
            $usuario->update($datos);

            if ($cambiaPassword) {
                $tokenActual = $usuario->currentAccessToken();

                $usuario->tokens()
                    ->when($tokenActual instanceof PersonalAccessToken, fn ($q) => $q->whereKeyNot($tokenActual->getKey()))
                    ->delete();
            }

            return $usuario->refresh()->load(['roles', 'permissions']);
        });
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

    private function esAdmin(User $usuario): bool
    {
        return $usuario->hasRole(Modulos::ROL_ADMIN);
    }

    /**
     * Debe llamarse dentro de una transacción. Bloquea a todos los administradores
     * activos (incluido el afectado) para que dos peticiones simultáneas no dejen
     * el sistema sin ninguno.
     */
    private function asegurarQueQuedeOtroAdmin(User $usuario, string $campo): void
    {
        $adminsActivos = User::role(Modulos::ROL_ADMIN)
            ->where('activo', true)
            ->orderBy('id')
            ->lockForUpdate()
            ->pluck('id');

        if ($adminsActivos->diff([$usuario->getKey()])->isEmpty()) {
            throw ValidationException::withMessages([$campo => 'Debe existir al menos un administrador activo.']);
        }
    }
}
