<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->statefulApi();
        // Permite exigir uno de varios permisos: permission:solicitudes.ver|beneficios.ver
        $middleware->alias([
            'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            // Dispositivos de conteo: X-Sensor-Codigo + token Bearer del sensor.
            'auth.sensor' => \App\Modules\Conteo\Middleware\AutenticarSensor::class,
        ]);
        $middleware->validateCsrfTokens(except: [
            'api/encargados',
            'api/encargados/*',
            'api/agrupaciones',
            'api/agrupaciones/*',
            'api/solicitudes-agrupaciones',
            'api/solicitudes-agrupaciones/*',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );
        // El framework responde "Too Many Attempts." sin traducir; se conservan 429 y sus cabeceras.
        $exceptions->render(function (ThrottleRequestsException $e, Request $request) {
            if (! $request->is('api/*')) {
                return null;
            }

            $segundos = max(1, (int) ($e->getHeaders()['Retry-After'] ?? 60));
            $minutos = (int) ceil($segundos / 60);
            $espera = match (true) {
                $segundos < 60 => "en {$segundos} segundos",
                $minutos === 1 => 'en 1 minuto',
                default => "en {$minutos} minutos",
            };

            return response()->json(
                ['message' => "Demasiados intentos. Intenta de nuevo {$espera}."],
                429,
                $e->getHeaders(),
            );
        });
    })->create();
