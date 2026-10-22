<?php

/**
 * Módulo de Personalización.
 */
return [
    /*
    | URL pública (idealmente HTTPS) con la que los destinatarios de los
    | correos descargan el escudo. Debe ser accesible desde internet: en
    | desarrollo APP_URL suele ser http://localhost:8000, que solo funciona
    | en la propia máquina. Se define en backend/.env.
    */
    'url_publica' => rtrim((string) env('PERSONALIZACION_URL_PUBLICA', env('APP_URL', 'http://localhost')), '/'),
];
