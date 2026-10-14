<?php

namespace App\Modules\Beneficios\Services;

use App\Modules\Beneficios\Models\AsignacionAlimentacion;
use App\Modules\Beneficios\Models\AsignacionAula;
use App\Modules\Beneficios\Models\AsignacionBeneficios;
use App\Modules\Beneficios\Models\AsignacionMobiliario;
use App\Modules\Beneficios\Models\AsignacionTransporte;
use App\Modules\SolicitudesAgrupaciones\Models\SolicitudAgrupacion;
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

            $cantidadIntegrantes = $this->obtenerCantidadIntegrantes($asignacion->id_solicitud_agrupacion);

            $this->guardarColeccion($asignacion, 'mobiliarios', $datos, function ($item) use ($asignacion) {
                return AsignacionMobiliario::create([
                    'id_asignacion_beneficios' => $asignacion->id,
                    'id_mobiliario' => $item['id_mobiliario'],
                    'cantidad' => $item['cantidad'],
                ]);
            });

            $this->guardarColeccion($asignacion, 'alimentaciones', $datos, function ($item) use ($asignacion, $cantidadIntegrantes) {
                return AsignacionAlimentacion::create([
                    'id_asignacion_beneficios' => $asignacion->id,
                    'id_alimentacion' => $item['id_alimentacion'],
                    'cantidad' => $cantidadIntegrantes,
                ]);
            });

            $this->guardarColeccion($asignacion, 'aulas', $datos, function ($item) use ($asignacion) {
                return AsignacionAula::create([
                    'id_asignacion_beneficios' => $asignacion->id,
                    'id_aula' => $item['id_aula'],
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

            foreach (['mobiliarios', 'alimentaciones', 'aulas', 'transportes'] as $coleccion) {
                if (! array_key_exists($coleccion, $datos)) {
                    continue;
                }

                $this->reemplazarColeccion($asignacion, $coleccion, $datos[$coleccion]);
            }

            return $this->obtenerPorId($asignacion->id);
        });
    }

    /**
     * La cantidad de cada alimentación asignada no la decide el cliente: siempre
     * se toma de agrupacion.cantidad_integrantes para que no pueda desincronizarse
     * ni ser manipulada desde el frontend.
     */
    private function obtenerCantidadIntegrantes(int $idSolicitudAgrupacion): int
    {
        return SolicitudAgrupacion::with('agrupacion')
            ->findOrFail($idSolicitudAgrupacion)
            ->agrupacion
            ->cantidad_integrantes;
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
            ],
            'alimentaciones' => [
                'model' => AsignacionAlimentacion::class,
            ],
            'aulas' => [
                'model' => AsignacionAula::class,
            ],
            'transportes' => [
                'model' => AsignacionTransporte::class,
            ],
        ];

        $config = $map[$coleccion] ?? null;

        if ($config === null) {
            return;
        }

        $asignacion->{$coleccion}()->delete();

        $cantidadIntegrantes = $coleccion === 'alimentaciones'
            ? $this->obtenerCantidadIntegrantes($asignacion->id_solicitud_agrupacion)
            : null;

        foreach ($items as $item) {
            $payload = ['id_asignacion_beneficios' => $asignacion->id];

            if (isset($item['id_mobiliario'])) {
                $payload['id_mobiliario'] = $item['id_mobiliario'];
                $payload['cantidad'] = $item['cantidad'];
            }

            if (isset($item['id_alimentacion'])) {
                $payload['id_alimentacion'] = $item['id_alimentacion'];
                $payload['cantidad'] = $cantidadIntegrantes;
            }

            if (isset($item['id_aula'])) {
                $payload['id_aula'] = $item['id_aula'];
            }

            if (isset($item['matricula'])) {
                $payload['matricula'] = $item['matricula'];
                $payload['id_ruta'] = $item['id_ruta'];
            }

            $config['model']::create($payload);
        }
    }
}
