<?php

namespace App\Modules\Conteo\Middleware;

use App\Modules\Conteo\Models\SensorConteo;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Autentica a un dispositivo de conteo (ESP32 o puente serial).
 *
 * El dispositivo se identifica con su código estable (cabecera
 * X-Sensor-Codigo) y su token (Authorization: Bearer ...). Nunca con el
 * id autoincremental, que cambia entre instalaciones. Si las credenciales
 * son válidas, el sensor queda disponible en $request->attributes('sensor')
 * y se registra su última señal.
 */
class AutenticarSensor
{
    public const CABECERA_CODIGO = 'X-Sensor-Codigo';

    public function handle(Request $request, Closure $next): Response
    {
        $codigo = $request->header(self::CABECERA_CODIGO);

        $sensor = filled($codigo)
            ? SensorConteo::query()->where('codigo', $codigo)->first()
            : null;

        // Mismo mensaje si el código no existe o el token no coincide, para
        // no revelar qué códigos de sensor son válidos.
        if (! $sensor || ! $sensor->aceptaToken($request->bearerToken())) {
            return response()->json([
                'message' => 'Credenciales de dispositivo inválidas.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        if (! $sensor->activo) {
            return response()->json([
                'message' => 'El sensor está inactivo y no puede registrar movimientos.',
            ], Response::HTTP_FORBIDDEN);
        }

        // Sin tocar updated_at: la señal no es un cambio de configuración.
        SensorConteo::query()
            ->whereKey($sensor->id_sensor)
            ->toBase()
            ->update(['ultima_senal_en' => now()]);

        $request->attributes->set('sensor', $sensor);

        return $next($request);
    }
}
