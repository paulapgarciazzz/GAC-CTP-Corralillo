<?php

namespace App\Modules\Conteo\Services;

class ConteoReportService
{
    public function __construct(
        private readonly OcupacionService $ocupacionService
    ) {
    }

    /**
     * Estadísticas de conteo para una fecha específica: totales, ocupación
     * al cierre y máxima del día, y entradas/salidas/ocupación por hora.
     */
    public function generar(string $fecha): array
    {
        $porHora = [];
        for ($hora = 0; $hora < 24; $hora++) {
            $porHora[$hora] = ['hora' => $hora, 'entradas' => 0, 'salidas' => 0, 'ocupacion' => null];
        }

        $ocupacionMaxima = 0;
        $horaOcupacionMaxima = null;

        $totales = $this->ocupacionService->recorrer(
            $this->ocupacionService->movimientosDelDia($fecha),
            function ($movimiento, int $ocupacion) use (&$porHora, &$ocupacionMaxima, &$horaOcupacionMaxima) {
                $hora = (int) $movimiento->ocurrido_en->format('G');

                $porHora[$hora][$movimiento->tipo === 'entrada' ? 'entradas' : 'salidas']++;
                // Ocupación al final de esa hora (último movimiento dentro de ella).
                $porHora[$hora]['ocupacion'] = $ocupacion;

                if ($ocupacion > $ocupacionMaxima) {
                    $ocupacionMaxima = $ocupacion;
                    $horaOcupacionMaxima = $movimiento->ocurrido_en->format('H:i');
                }
            }
        );

        // Las horas sin movimientos conservan la ocupación de la hora anterior.
        $anterior = 0;
        foreach ($porHora as $hora => $fila) {
            $porHora[$hora]['ocupacion'] = $fila['ocupacion'] ?? $anterior;
            $anterior = $porHora[$hora]['ocupacion'];
        }

        return [
            'fecha' => $fecha,
            'entradas' => $totales['entradas'],
            'salidas' => $totales['salidas'],
            'ocupacion_estimada_fin_dia' => $totales['ocupacion'],
            'ocupacion_maxima' => $ocupacionMaxima,
            'hora_ocupacion_maxima' => $horaOcupacionMaxima,
            'hora_pico_entradas' => $this->horaPico($porHora, 'entradas'),
            'hora_pico_salidas' => $this->horaPico($porHora, 'salidas'),
            'distribucion_por_hora' => array_values($porHora),
        ];
    }

    private function horaPico(array $porHora, string $campo): ?int
    {
        $totales = array_column($porHora, $campo, 'hora');

        if (array_sum($totales) === 0) {
            return null;
        }

        return array_search(max($totales), $totales, true);
    }
}
