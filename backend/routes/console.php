<?php

use App\Modules\Conteo\Models\SensorConteo;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use Illuminate\Support\Facades\Schema;

// Borra los tokens de Sanctum vencidos (ver 'expiration' en config/sanctum.php).
Schedule::command('sanctum:prune-expired --hours=24')->daily();

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/*
| Genera (o reemplaza) el token de un sensor de conteo. Solo se guarda su
| hash: el token en claro se muestra una única vez para copiarlo al
| config.h del ESP32 o a la variable de entorno del puente serial.
*/
Artisan::command('conteo:token-sensor {codigo : Código estable del sensor, p. ej. ENTRADA-01}', function (string $codigo) {
    $sensor = SensorConteo::query()->where('codigo', $codigo)->first();

    if (! $sensor) {
        $this->error("No existe un sensor con el código {$codigo}.");

        return 1;
    }

    if ($sensor->token_hash !== null
        && ! $this->confirm("{$codigo} ya tiene un token. Si lo reemplazas, el dispositivo que lo usa dejará de poder enviar movimientos. ¿Continuar?")) {
        $this->info('Sin cambios.');

        return 0;
    }

    $token = $sensor->generarToken();

    $this->info("Token del sensor {$sensor->codigo} ({$sensor->nombre}, {$sensor->tipo}):");
    $this->line($token);
    $this->warn('Cópialo ahora: no se vuelve a mostrar y no debe subirse al repositorio.');

    return 0;
})->purpose('Genera el token de autenticación de un sensor de conteo');

/*
| Registra el hash de los tokens definidos en variables de entorno privadas
| (config/conteo.php). Pensado para el arranque en servidores sin Shell:
| solo toca la columna token_hash del sensor indicado, nunca crea sensores,
| no muestra el token y, si el sensor ya tiene otro token, lo conserva salvo
| que CONTEO_REEMPLAZAR_TOKENS sea true. Ejecutarlo varias veces no cambia nada.
*/
Artisan::command('conteo:sincronizar-tokens', function () {
    $tokens = array_filter(
        array_map(fn ($token) => trim((string) $token), config('conteo.tokens_sensores', [])),
        'filled'
    );

    if ($tokens === []) {
        $this->line('[conteo] No hay tokens de sensores en el entorno: sin cambios.');

        return 0;
    }

    if (! Schema::hasColumn('sensor_conteo', 'token_hash')) {
        $this->warn('[conteo] Falta la tabla sensor_conteo o su columna token_hash (¿migraciones pendientes?): sin cambios.');

        return 0;
    }

    $reemplazar = (bool) config('conteo.reemplazar_tokens');
    $longitudMinima = (int) config('conteo.longitud_minima_token');

    foreach ($tokens as $codigo => $token) {
        if (strlen($token) < $longitudMinima) {
            $this->warn("[conteo] {$codigo}: el token del entorno tiene menos de {$longitudMinima} caracteres; se ignora.");

            continue;
        }

        $sensor = SensorConteo::query()->where('codigo', $codigo)->first();

        if (! $sensor) {
            $this->warn("[conteo] {$codigo}: no existe el sensor; se ignora (no se crean sensores).");
        } elseif ($sensor->aceptaToken($token)) {
            $this->line("[conteo] {$codigo}: el token ya está registrado.");
        } elseif ($sensor->token_hash !== null && ! $reemplazar) {
            $this->warn("[conteo] {$codigo}: ya tiene otro token y se conserva. Para reemplazarlo define CONTEO_REEMPLAZAR_TOKENS=true en un despliegue.");
        } else {
            $sensor->establecerToken($token);
            $this->info("[conteo] {$codigo}: token registrado (solo su hash).");
        }
    }

    return 0;
})->purpose('Registra el hash de los tokens de sensores definidos en el entorno');
