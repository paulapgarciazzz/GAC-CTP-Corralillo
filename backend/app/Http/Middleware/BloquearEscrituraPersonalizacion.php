<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;

/**
 * Bloqueo temporal para los endpoints de escritura del módulo de
 * Personalización, mientras el módulo de Gestión de Usuarios (a cargo de
 * otra persona del equipo) entrega autenticación y roles reales.
 *
 * Este middleware rechaza SIEMPRE la petición con 403. Cuando la
 * autenticación esté lista, se reemplaza este middleware por el de
 * rol/permiso correspondiente en las rutas que lo usan — no hace falta
 * tocar controladores ni la estructura de rutas.
 */
class BloquearEscrituraPersonalizacion
{
    public function handle(Request $request, Closure $next)
    {
        throw new HttpException(
            403,
            'Esta acción administrativa está temporalmente deshabilitada '
                . 'hasta que se integre la autenticación del módulo de '
                . 'Gestión de Usuarios.'
        );
    }
}
