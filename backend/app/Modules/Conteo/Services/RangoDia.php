<?php

namespace App\Modules\Conteo\Services;

use Carbon\Carbon;

/**
 * Inicio y fin de un día en America/Costa_Rica, para filtrar con
 * whereBetween (aprovecha el índice de ocurrido_en, a diferencia de
 * whereDate).
 */
final class RangoDia
{
    /**
     * @return array{0: string, 1: string}
     */
    public static function de(string $fecha): array
    {
        $dia = Carbon::parse($fecha, 'America/Costa_Rica');

        return [
            $dia->copy()->startOfDay()->toDateTimeString(),
            $dia->copy()->endOfDay()->toDateTimeString(),
        ];
    }
}
