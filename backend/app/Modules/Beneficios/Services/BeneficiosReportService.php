<?php

namespace App\Modules\Beneficios\Services;

use App\Modules\Beneficios\Models\AsignacionBeneficios;
use Illuminate\Database\Eloquent\Collection;

class BeneficiosReportService
{
    private const CATEGORIAS_VALIDAS = ['alimentacion', 'mobiliario', 'aula', 'transporte'];

    public function generar(array $filtros): array
    {
        $fechaDesde = $filtros['fecha_desde'];
        $fechaHasta = $filtros['fecha_hasta'];
        $categoria = $filtros['categoria'] ?? 'todos';
        $tipoAlimentacion = $filtros['tipo_alimentacion'] ?? null;

        $categorias = $categoria === 'todos' ? self::CATEGORIAS_VALIDAS : [$categoria];

        $asignaciones = $this->obtenerAsignaciones($fechaDesde, $fechaHasta, $categorias);

        $resultado = [
            'filtros' => [
                'fecha_desde' => $fechaDesde,
                'fecha_hasta' => $fechaHasta,
                'categoria' => $categoria,
                'tipo_alimentacion' => $tipoAlimentacion,
            ],
        ];

        $resumen = [];

        if (in_array('alimentacion', $categorias, true)) {
            $seccion = $this->generarAlimentacion($asignaciones, $tipoAlimentacion);
            $resultado['alimentacion'] = $seccion;
            $resumen['alimentacion'] = ['total_general' => $seccion['total_general']];
        }

        if (in_array('mobiliario', $categorias, true)) {
            $seccion = $this->generarMobiliario($asignaciones);
            $resultado['mobiliario'] = $seccion;
            $resumen['mobiliario'] = ['total_general' => $seccion['total_general']];
        }

        if (in_array('aula', $categorias, true)) {
            $seccion = $this->generarAula($asignaciones);
            $resultado['aula'] = $seccion;
            $resumen['aula'] = $seccion['totales'];
        }

        if (in_array('transporte', $categorias, true)) {
            $seccion = $this->generarTransporte($asignaciones);
            $resultado['transporte'] = $seccion;
            $resumen['transporte'] = $seccion['totales'];
        }

        $resultado['resumen'] = $resumen;

        return $resultado;
    }

    private function obtenerAsignaciones(string $fechaDesde, string $fechaHasta, array $categorias): Collection
    {
        $relaciones = ['solicitudAgrupacion.agrupacion'];

        if (in_array('alimentacion', $categorias, true)) {
            $relaciones[] = 'alimentaciones.alimentacion';
        }

        if (in_array('mobiliario', $categorias, true)) {
            $relaciones[] = 'mobiliarios.mobiliario';
        }

        if (in_array('aula', $categorias, true)) {
            $relaciones[] = 'aulas.aula';
        }

        if (in_array('transporte', $categorias, true)) {
            $relaciones[] = 'transportes.transporte';
            $relaciones[] = 'transportes.ruta';
        }

        return AsignacionBeneficios::query()
            ->with($relaciones)
            ->whereHas(
                'solicitudAgrupacion',
                fn ($query) => $query->whereBetween('fecha_asignada', [$fechaDesde, $fechaHasta])
            )
            ->orderBy('id')
            ->get();
    }

    private function generarAlimentacion(Collection $asignaciones, ?string $tipoAlimentacion): array
    {
        $detalle = [];

        foreach ($asignaciones as $asignacion) {
            foreach ($asignacion->alimentaciones as $item) {
                $tipo = $item->alimentacion?->tiempo_comida;

                if ($tipoAlimentacion !== null && $tipo !== $tipoAlimentacion) {
                    continue;
                }

                $detalle[] = array_merge($this->datosComunes($asignacion), [
                    'tipo_alimentacion' => $tipo,
                    'cantidad' => $item->cantidad,
                ]);
            }
        }

        $totalesPorTipo = collect($detalle)
            ->groupBy('tipo_alimentacion')
            ->map(fn ($items, $tipo) => [
                'tipo_alimentacion' => $tipo,
                'total' => $items->sum('cantidad'),
            ])
            ->values()
            ->all();

        return [
            'detalle' => $detalle,
            'totales_por_tipo' => $totalesPorTipo,
            'total_general' => collect($detalle)->sum('cantidad'),
        ];
    }

    private function generarMobiliario(Collection $asignaciones): array
    {
        $detalle = [];

        foreach ($asignaciones as $asignacion) {
            foreach ($asignacion->mobiliarios as $item) {
                $detalle[] = array_merge($this->datosComunes($asignacion), [
                    'mobiliario' => $item->mobiliario?->nombre,
                    'cantidad' => $item->cantidad,
                    'encargado' => $item->mobiliario?->encargado,
                ]);
            }
        }

        $totalesPorTipo = collect($detalle)
            ->groupBy('mobiliario')
            ->map(fn ($items, $nombre) => [
                'mobiliario' => $nombre,
                'total' => $items->sum('cantidad'),
            ])
            ->values()
            ->all();

        return [
            'detalle' => $detalle,
            'totales_por_tipo' => $totalesPorTipo,
            'total_general' => collect($detalle)->sum('cantidad'),
        ];
    }

    private function generarAula(Collection $asignaciones): array
    {
        $detalle = [];

        foreach ($asignaciones as $asignacion) {
            $cantidadIntegrantes = $asignacion->solicitudAgrupacion?->agrupacion?->cantidad_integrantes;

            foreach ($asignacion->aulas as $item) {
                $capacidad = $item->aula?->capacidad;
                $sobrecapacidad = $cantidadIntegrantes !== null
                    && $capacidad !== null
                    && $cantidadIntegrantes > $capacidad;

                $detalle[] = array_merge($this->datosComunes($asignacion), [
                    'aula' => $item->aula?->nombre,
                    'capacidad' => $capacidad,
                    'encargado' => $item->aula?->encargado,
                    'cantidad_integrantes' => $cantidadIntegrantes,
                    'sobrecapacidad' => $sobrecapacidad,
                    'exceso' => $sobrecapacidad ? $cantidadIntegrantes - $capacidad : 0,
                ]);
            }
        }

        return [
            'detalle' => $detalle,
            'totales' => [
                'total_aulas_asignadas' => count($detalle),
                'capacidad_total' => (int) collect($detalle)->sum('capacidad'),
                'total_personas_alojadas' => (int) collect($detalle)->sum('cantidad_integrantes'),
                'asignaciones_con_sobrecapacidad' => collect($detalle)->where('sobrecapacidad', true)->count(),
            ],
        ];
    }

    private function generarTransporte(Collection $asignaciones): array
    {
        $detalle = [];

        foreach ($asignaciones as $asignacion) {
            foreach ($asignacion->transportes as $item) {
                $detalle[] = array_merge($this->datosComunes($asignacion), [
                    'matricula' => $item->matricula,
                    'tipo' => $item->transporte?->tipo,
                    'capacidad' => $item->transporte?->capacidad,
                    'nombre_conductor' => $item->transporte?->nombre_conductor,
                    'apellido_conductor' => $item->transporte?->apellido_conductor,
                    'cedula_conductor' => $item->transporte?->cedula_conductor,
                    'ruta' => $item->ruta?->nombre_ruta,
                ]);
            }
        }

        return [
            'detalle' => $detalle,
            'totales' => [
                'total_vehiculos_asignados' => count($detalle),
            ],
        ];
    }

    private function datosComunes(AsignacionBeneficios $asignacion): array
    {
        return [
            'id_asignacion' => $asignacion->id,
            'id_agrupacion' => $asignacion->solicitudAgrupacion?->agrupacion?->id,
            'agrupacion' => $asignacion->solicitudAgrupacion?->agrupacion?->nombre,
            'fecha_asignada' => $asignacion->solicitudAgrupacion?->fecha_asignada?->toDateString(),
        ];
    }
}
