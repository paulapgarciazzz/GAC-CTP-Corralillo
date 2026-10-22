<?php

use App\Modules\Conteo\Models\SensorConteo;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

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
