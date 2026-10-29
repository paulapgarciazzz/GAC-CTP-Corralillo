<?php

namespace App\Providers;

use App\Modules\Beneficios\Services\AsignacionBeneficiosService;
use App\Modules\Conteo\Middleware\AutenticarSensor;
use App\Modules\SolicitudesAgrupaciones\Models\Agrupacion;
use App\Modules\Usuarios\Support\Modulos;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\ConfigurationUrlParser;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Throwable;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Base de datos que nunca debe sufrir una operación destructiva de
     * Laravel (migrate:fresh/refresh/reset/rollback, db:wipe), sin importar
     * qué APP_ENV o qué archivo .env* haya resuelto la conexión así.
     *
     * Ver incidente del 2026-10-11/12: un `php artisan test` terminó
     * conectado a esta base y RefreshDatabase la vació por completo con
     * migrate:fresh. Esta comprobación no depende de phpunit.xml ni de los
     * .env*: lee la configuración ya resuelta en tiempo de ejecución
     * (también desde bootstrap/cache/config.php si está en caché).
     */
    private const BASE_DE_DATOS_PROTEGIDA = 'proyecto_db';

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

        DB::prohibitDestructiveCommands($this->algunaConexionApuntaABaseProtegida());

        // Las raciones de alimentación asignadas dependen de los integrantes
        // de la agrupación; se actualizan cuando estos cambian.
        Agrupacion::updated(function (Agrupacion $agrupacion) {
            if ($agrupacion->wasChanged('cantidad_integrantes')) {
                app(AsignacionBeneficiosService::class)->sincronizarRaciones($agrupacion);
            }
        });

        // Dispositivos de conteo: se limita antes de autenticar, para frenar
        // intentos de adivinar tokens. Un sensor real queda muy por debajo
        // (una detección cada pocos segundos y un latido por minuto); ante un
        // 429 el firmware reintenta más tarde con el mismo evento.
        RateLimiter::for('sensores', fn (Request $request) => Limit::perMinute(120)->by(
            $request->ip() . '|' . $request->header(AutenticarSensor::CABECERA_CODIGO)
        ));
    }

    /**
     * Revisa todas las conexiones, no solo la predeterminada, porque
     * `--database=` puede elegir cualquiera. Aplica DB_URL igual que Laravel
     * al conectarse (la URL tiene prioridad sobre DB_DATABASE), sin abrir
     * ninguna conexión. Si la configuración no se puede interpretar, bloquea
     * por precaución.
     */
    private function algunaConexionApuntaABaseProtegida(): bool
    {
        try {
            $parser = new ConfigurationUrlParser;

            return collect(config('database.connections'))->contains(
                fn ($config) => ($parser->parseConfiguration($config)['database'] ?? null) === self::BASE_DE_DATOS_PROTEGIDA
            );
        } catch (Throwable) {
            return true;
        }
    }
}
