<?php

namespace App\Modules\Conteo\Services;

use App\Modules\Conteo\Models\MovimientoConteo;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class OcupacionService
{
    /**
     * Ocupación estimada del día actual (fecha de Costa Rica).
     */
    public function actual(): array
    {
        return $this->paraFecha(
            Carbon::now('America/Costa_Rica')->toDateString()
        );
    }

    /**
     * Entradas, salidas y ocupación estimada para una fecha dada.
     */
    public function paraFecha(string $fecha): array
    {
        $movimientos = $this->movimientosDelDia($fecha);
        $recorrido = $this->recorrer($movimientos);

        return [
            'fecha' => $fecha,
            'entradas' => $recorrido['entradas'],
            'salidas' => $recorrido['salidas'],
            'ocupacion' => $recorrido['ocupacion'],
            'ultimo_movimiento_en' => $movimientos->last()?->ocurrido_en?->toDateTimeString(),
        ];
    }

    /**
     * Movimientos del día en orden cronológico, solo con las columnas que
     * necesitan la ocupación y los reportes.
     *
     * @return Collection<int, MovimientoConteo>
     */
    public function movimientosDelDia(string $fecha): Collection
    {
        return MovimientoConteo::query()
            ->select(['id_movimiento', 'tipo', 'ocurrido_en'])
            ->whereBetween('ocurrido_en', RangoDia::de($fecha))
            ->orderBy('ocurrido_en')
            ->orderBy('id_movimiento')
            ->get();
    }

    /**
     * Recorre los movimientos en orden. La ocupación nunca baja de 0 en
     * ningún momento: una salida sin entrada previa (sensor que no detectó a
     * alguien al entrar) no "adelanta" salidas que luego anularían entradas
     * reales. Los totales de entradas y salidas no se alteran.
     *
     * @param  callable(MovimientoConteo, int): void|null  $alAvanzar
     * @return array{entradas: int, salidas: int, ocupacion: int}
     */
    public function recorrer(Collection $movimientos, ?callable $alAvanzar = null): array
    {
        $entradas = 0;
        $salidas = 0;
        $ocupacion = 0;

        foreach ($movimientos as $movimiento) {
            if ($movimiento->tipo === 'entrada') {
                $entradas++;
                $ocupacion++;
            } else {
                $salidas++;
                $ocupacion = max(0, $ocupacion - 1);
            }

            if ($alAvanzar) {
                $alAvanzar($movimiento, $ocupacion);
            }
        }

        return [
            'entradas' => $entradas,
            'salidas' => $salidas,
            'ocupacion' => $ocupacion,
        ];
    }
}
