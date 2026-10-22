<?php

namespace App\Modules\Conteo\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DispositivoController
{
    /**
     * Latido del dispositivo: confirma conexión y credenciales sin registrar
     * ningún movimiento. AutenticarSensor ya actualizó la última señal.
     */
    public function latido(Request $request): JsonResponse
    {
        $sensor = $request->attributes->get('sensor');

        return response()->json([
            'data' => [
                'codigo' => $sensor->codigo,
                'nombre' => $sensor->nombre,
                'tipo' => $sensor->tipo,
                'hora_servidor' => now()->toDateTimeString(),
            ],
        ]);
    }
}
