<?php

namespace App\Providers;

use App\Modules\Usuarios\Support\Modulos;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // El rol administrador tiene acceso total a todos los permisos.
        Gate::before(fn ($user) => $user->hasRole(Modulos::ROL_ADMIN) ? true : null);
    }
}
