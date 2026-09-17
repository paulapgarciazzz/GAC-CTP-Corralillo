<?php

namespace App\Modules\Beneficios\Services;

use App\Modules\Beneficios\Models\AsignacionAlimentacion;
use App\Modules\Beneficios\Models\AsignacionAula;
use App\Modules\Beneficios\Models\AsignacionBeneficios;
use App\Modules\Beneficios\Models\AsignacionMobiliario;
use App\Modules\Beneficios\Models\AsignacionTarima;
use App\Modules\Beneficios\Models\AsignacionTransporte;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class AsignacionBeneficiosService
{
    public function listar(): Collection
    {
        return AsignacionBeneficios::query()
            ->with([
                'solicitudAgrupacion.estado',
                'mobiliarios.mobiliario',
                'alimentaciones.alimentacion',
                'aulas.aula',
                'tarimas.tarima',
                'transportes.transporte',
                'transportes.ruta',
            ])
            ->orderBy('id')
            ->get();
    }

    public function obtenerPorId(int $id): AsignacionBeneficios
    {
        return AsignacionBeneficios::query()
            ->with([
                'solicitudAgrupacion.estado',
                'mobiliarios.mobiliario',
                'alimentaciones.alimentacion',
                'aulas.aula',
                'tarimas.tarima',
                'transportes.transporte',
                'transportes.ruta',
            ])
            ->findOrFail($id);
    }

    public function crear(array $datos): AsignacionBeneficios
    {
        return DB::transaction(function () use ($datos) {
            $asignacion = AsignacionBeneficios::create([
                'id_solicitud_agrupacion' => $datos['id_solicitud_agrupacion'],
                'observaciones' => $datos['observaciones'] ?? null,
            ]);

            $this->guardarColeccion($asignacion, 'mobiliarios', $datos, function ($item) use ($asignacion) {
                return AsignacionMobiliario::create([
                    'id_asignacion_beneficios' => $asignacion->id,
                    'id_mobiliario' => $item['id_mobiliario'],
                    'cantidad' => $item['cantidad'],
                ]);
            });

            $this->guardarColeccion($asignacion, 'alimentaciones', $datos, function ($item) use ($asignacion) {
                return AsignacionAlimentacion::create([
                    'id_asignacion_beneficios' => $asignacion->id,
                    'id_alimentacion' => $item['id_alimentacion'],
                    'cantidad' => $item['cantidad'],
                ]);
            });

            $this->guardarColeccion($asignacion, 'aulas', $datos, function ($item) use ($asignacion) {
                return AsignacionAula::create([
                    'id_asignacion_beneficios' => $asignacion->id,
                    'id_aula' => $item['id_aula'],
                ]);
            });

            $this->guardarColeccion($asignacion, 'tarimas', $datos, function ($item) use ($asignacion) {
                return AsignacionTarima::create([
                    'id_asignacion_beneficios' => $asignacion->id,
                    'id_tarima' => $item['id_tarima'],
                ]);
            });

            $this->guardarColeccion($asignacion, 'transportes', $datos, function ($item) use ($asignacion) {
                return AsignacionTransporte::create([
                    'id_asignacion_beneficios' => $asignacion->id,
                    'matricula' => $item['matricula'],
                    'id_ruta' => $item['id_ruta'],
                ]);
            });

            return $this->obtenerPorId($asignacion->id);
        });
    }

    public function actualizar(AsignacionBeneficios $asignacion, array $datos): AsignacionBeneficios
    {
        return DB::transaction(function () use ($asignacion, $datos) {
            if (array_key_exists('id_solicitud_agrupacion', $datos)) {
                $asignacion->id_solicitud_agrupacion = $datos['id_solicitud_agrupacion'];
            }

            if (array_key_exists('observaciones', $datos)) {
                $asignacion->observaciones = $datos['observaciones'];
            }

            $asignacion->save();

            foreach (['mobiliarios', 'alimentaciones', 'aulas', 'tarimas', 'transportes'] as $coleccion) {
                if (! array_key_exists($coleccion, $datos)) {
                    continue;
                }

                $this->reemplazarColeccion($asignacion, $coleccion, $datos[$coleccion]);
            }

            return $this->obtenerPorId($asignacion->id);
        });
    }

    private function guardarColeccion(AsignacionBeneficios $asignacion, string $coleccion, array $datos, callable $factory): void
    {
        if (! isset($datos[$coleccion]) || ! is_array($datos[$coleccion])) {
            return;
        }

        foreach ($datos[$coleccion] as $item) {
            $factory($item);
        }
    }

    private function reemplazarColeccion(AsignacionBeneficios $asignacion, string $coleccion, ?array $items): void
    {
        if ($items === null) {
            return;
        }

        $map = [
            'mobiliarios' => [
                'model' => AsignacionMobiliario::class,
                'campo' => 'id_mobiliario',
                'cantidad' => 'cantidad',
            ],
            'alimentaciones' => [
                'model' => AsignacionAlimentacion::class,
                'campo' => 'id_alimentacion',
                'cantidad' => 'cantidad',
            ],
            'aulas' => [
                'model' => AsignacionAula::class,
                'campo' => 'id_aula',
                'cantidad' => null,
            ],
            'tarimas' => [
                'model' => AsignacionTarima::class,
                'campo' => 'id_tarima',
                'cantidad' => null,
            ],
            'transportes' => [
                'model' => AsignacionTransporte::class,
                'campo' => 'matricula',
                'cantidad' => null,
            ],
        ];

        $config = $map[$coleccion] ?? null;

        if ($config === null) {
            return;
        }

        $asignacion->{$coleccion}()->delete();

        foreach ($items as $item) {
            $payload = ['id_asignacion_beneficios' => $asignacion->id];

            if (isset($item['id_mobiliario'])) {
                $payload['id_mobiliario'] = $item['id_mobiliario'];
                $payload['cantidad'] = $item['cantidad'];
            }

            if (isset($item['id_alimentacion'])) {
                $payload['id_alimentacion'] = $item['id_alimentacion'];
                $payload['cantidad'] = $item['cantidad'];
            }

            if (isset($item['id_aula'])) {
                $payload['id_aula'] = $item['id_aula'];
            }

            if (isset($item['id_tarima'])) {
                $payload['id_tarima'] = $item['id_tarima'];
            }

            if (isset($item['matricula'])) {
                $payload['matricula'] = $item['matricula'];
                $payload['id_ruta'] = $item['id_ruta'];
            }

            $config['model']::create($payload);
        }
    }
}