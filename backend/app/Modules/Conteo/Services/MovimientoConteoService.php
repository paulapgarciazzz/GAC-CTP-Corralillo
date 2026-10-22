<?php

namespace App\Modules\Conteo\Services;

use App\Modules\Conteo\Models\MovimientoConteo;
use App\Modules\Conteo\Models\SensorConteo;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\UniqueConstraintViolationException;

class MovimientoConteoService
{
    /**
     * Registra un movimiento de forma idempotente. El tipo (entrada/salida)
     * siempre se toma del sensor autenticado, nunca del cliente, y la
     * fecha/hora siempre la genera este servidor en America/Costa_Rica.
     *
     * Si el identificador_evento ya existe es un reintento de un envío que sí
     * llegó (la respuesta se perdió): se devuelve el movimiento existente con
     * creado = false, sin contar dos veces.
     *
     * @return array{movimiento: MovimientoConteo, creado: bool}
     */
    public function registrar(SensorConteo $sensor, string $identificadorEvento): array
    {
        $existente = $this->buscarPorIdentificador($identificadorEvento);

        if ($existente) {
            return ['movimiento' => $existente, 'creado' => false];
        }

        try {
            $movimiento = MovimientoConteo::create([
                'id_sensor' => $sensor->id_sensor,
                'tipo' => $sensor->tipo,
                'identificador_evento' => $identificadorEvento,
                'ocurrido_en' => Carbon::now('America/Costa_Rica'),
            ]);
        } catch (UniqueConstraintViolationException) {
            // Dos reintentos simultáneos: el otro ya lo insertó.
            return [
                'movimiento' => $this->buscarPorIdentificador($identificadorEvento),
                'creado' => false,
            ];
        }

        return ['movimiento' => $movimiento->load('sensor'), 'creado' => true];
    }

    /**
     * Historial paginado de movimientos, del más reciente al más antiguo,
     * con filtros opcionales por fecha y tipo. Solo lectura: nunca modifica
     * los movimientos ya registrados.
     */
    public function listar(array $filtros): LengthAwarePaginator
    {
        $query = MovimientoConteo::query()
            ->with('sensor')
            ->orderByDesc('ocurrido_en')
            ->orderByDesc('id_movimiento');

        if (! empty($filtros['fecha'])) {
            $query->whereBetween('ocurrido_en', RangoDia::de($filtros['fecha']));
        }

        if (! empty($filtros['tipo'])) {
            $query->where('tipo', $filtros['tipo']);
        }

        return $query->paginate($filtros['per_page'] ?? 20);
    }

    private function buscarPorIdentificador(string $identificadorEvento): ?MovimientoConteo
    {
        return MovimientoConteo::query()
            ->with('sensor')
            ->where('identificador_evento', $identificadorEvento)
            ->first();
    }
}
