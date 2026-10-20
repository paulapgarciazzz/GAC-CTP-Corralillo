<?php

/**
 * Usuario administrador inicial que crea PermisosSeeder.
 * Las credenciales se definen solo en backend/.env (nunca en el código).
 */
return [
    'name' => env('ADMIN_NAME', 'Administrador'),
    'email' => env('ADMIN_EMAIL'),
    'password' => env('ADMIN_PASSWORD'),
];
