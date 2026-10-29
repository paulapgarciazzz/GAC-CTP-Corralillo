<?php

/**
 * Tokens de los sensores de conteo definidos como variables de entorno
 * privadas del servidor (p. ej. en Render, donde no hay Shell para usar
 * `php artisan conteo:token-sensor`). Nunca se escriben en el código.
 *
 * `php artisan conteo:sincronizar-tokens` (lo ejecuta el entrypoint en cada
 * arranque) guarda solo su hash. Si el sensor ya tiene otro token, lo
 * conserva salvo que CONTEO_REEMPLAZAR_TOKENS sea true.
 */
return [
    'tokens_sensores' => [
        'ENTRADA-01' => env('CONTEO_TOKEN_ENTRADA_01'),
        'SALIDA-01' => env('CONTEO_TOKEN_SALIDA_01'),
    ],

    'reemplazar_tokens' => (bool) env('CONTEO_REEMPLAZAR_TOKENS', false),

    // Mínimo exigido a un token recibido por entorno (los generados por la
    // aplicación tienen 48 caracteres).
    'longitud_minima_token' => 32,
];
