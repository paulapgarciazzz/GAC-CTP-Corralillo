<?php

namespace App\Modules\Beneficios\Services;

use App\Modules\Beneficios\Models\AsignacionBeneficios;
use App\Modules\Beneficios\Models\SolicitudAlimentacion;
use App\Modules\Beneficios\Models\SolicitudMobiliario;
use App\Modules\Beneficios\Models\SolicitudTransporte;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class AsignacionBeneficiosService
{
    public function listar(): Collection
    {
        return AsignacionBeneficios::query()
            ->with([
                'agrupacion',
                'solicitudAlimentacion.alimentacion',
                'solicitudMobiliario.mobiliario',
                'tarima',
                'aula',
                'solicitudTransporte.transporte',
                'solicitudTransporte.ruta',
            ])
            ->orderBy('id_solicitud_beneficios')
            ->get();
    }

    public function obtenerPorId(int $id): AsignacionBeneficios
    {
        return AsignacionBeneficios::query()
            ->with([
                'agrupacion',
                'solicitudAlimentacion.alimentacion',
                'solicitudMobiliario.mobiliario',
                'tarima',
                'aula',
                'solicitudTransporte.transporte',
                'solicitudTransporte.ruta',
            ])
            ->findOrFail($id);
    }

    public function crear(array $datos): AsignacionBeneficios
    {
        return DB::transaction(function () use ($datos) {
            $idSolicitudAlimentacion = null;
            $idSolicitudMobiliario = null;
            $idSolicitudTransporte = null;

            if (!empty($datos['id_alimentacion'])) {
                $solicitudAlimentacion = SolicitudAlimentacion::create([
                    'id_alimentacion' => $datos['id_alimentacion'],
                ]);

                $idSolicitudAlimentacion =
                    $solicitudAlimentacion->id_solicitud_alimentacion;
            }

            if (!empty($datos['mobiliario'])) {
                $solicitudMobiliario = SolicitudMobiliario::create([
                    'cantidad' => $datos['mobiliario']['cantidad'],
                    'id_sol_mobiliario' =>
                        $datos['mobiliario']['id_mobiliario'],
                ]);

                $idSolicitudMobiliario =
                    $solicitudMobiliario->id_solicitud_mobiliario;
            }

            if (!empty($datos['transporte'])) {
                $solicitudTransporte = SolicitudTransporte::create([
                    'matricula' => $datos['transporte']['matricula'],
                    'id_ruta' => $datos['transporte']['id_ruta'],
                ]);

                $idSolicitudTransporte =
                    $solicitudTransporte->id_solicitud_transporte;
            }

            $asignacion = AsignacionBeneficios::create([
                'id_agrupacion' => $datos['id_agrupacion'],
                'id_solicitud_alimentacion' =>
                    $idSolicitudAlimentacion,
                'id_solicitud_mobiliario' =>
                    $idSolicitudMobiliario,
                'id_tarima' => $datos['id_tarima'] ?? null,
                'id_aula' => $datos['id_aula'] ?? null,
                'id_solicitud_transporte' =>
                    $idSolicitudTransporte,
                'fecha_solicitud' => $datos['fecha_solicitud'],
            ]);

            return $this->obtenerPorId(
                $asignacion->id_solicitud_beneficios
            );
        });
    }

    public function actualizar(
        AsignacionBeneficios $asignacion,
        array $datos
    ): AsignacionBeneficios {
        return DB::transaction(function () use ($asignacion, $datos) {

            if (array_key_exists('id_agrupacion', $datos)) {
                $asignacion->id_agrupacion = $datos['id_agrupacion'];
            }

            if (array_key_exists('fecha_solicitud', $datos)) {
                $asignacion->fecha_solicitud = $datos['fecha_solicitud'];
            }

            if (array_key_exists('id_tarima', $datos)) {
                $asignacion->id_tarima = $datos['id_tarima'];
            }

            if (array_key_exists('id_aula', $datos)) {
                $asignacion->id_aula = $datos['id_aula'];
            }

            if (array_key_exists('id_alimentacion', $datos)) {
                if ($datos['id_alimentacion'] === null) {
                    if ($asignacion->id_solicitud_alimentacion !== null) {
                        $solicitud = SolicitudAlimentacion::find(
                            $asignacion->id_solicitud_alimentacion
                        );

                        $asignacion->id_solicitud_alimentacion = null;
                        $asignacion->save();

                        $solicitud?->delete();
                    }
                } elseif (
                    $asignacion->id_solicitud_alimentacion !== null
                ) {
                    SolicitudAlimentacion::findOrFail(
                        $asignacion->id_solicitud_alimentacion
                    )->update([
                        'id_alimentacion' => $datos['id_alimentacion'],
                    ]);
                } else {
                    $solicitud = SolicitudAlimentacion::create([
                        'id_alimentacion' => $datos['id_alimentacion'],
                    ]);

                    $asignacion->id_solicitud_alimentacion =
                        $solicitud->id_solicitud_alimentacion;
                }
            }

            if (array_key_exists('mobiliario', $datos)) {
                if ($datos['mobiliario'] === null) {
                    if ($asignacion->id_solicitud_mobiliario !== null) {
                        $solicitud = SolicitudMobiliario::find(
                            $asignacion->id_solicitud_mobiliario
                        );

                        $asignacion->id_solicitud_mobiliario = null;
                        $asignacion->save();

                        $solicitud?->delete();
                    }
                } elseif (
                    $asignacion->id_solicitud_mobiliario !== null
                ) {
                    SolicitudMobiliario::findOrFail(
                        $asignacion->id_solicitud_mobiliario
                    )->update([
                        'cantidad' => $datos['mobiliario']['cantidad'],
                        'id_sol_mobiliario' =>
                            $datos['mobiliario']['id_mobiliario'],
                    ]);
                } else {
                    $solicitud = SolicitudMobiliario::create([
                        'cantidad' => $datos['mobiliario']['cantidad'],
                        'id_sol_mobiliario' =>
                            $datos['mobiliario']['id_mobiliario'],
                    ]);

                    $asignacion->id_solicitud_mobiliario =
                        $solicitud->id_solicitud_mobiliario;
                }
            }

            if (array_key_exists('transporte', $datos)) {
                if ($datos['transporte'] === null) {
                    if ($asignacion->id_solicitud_transporte !== null) {
                        $solicitud = SolicitudTransporte::find(
                            $asignacion->id_solicitud_transporte
                        );

                        $asignacion->id_solicitud_transporte = null;
                        $asignacion->save();

                        $solicitud?->delete();
                    }
                } elseif (
                    $asignacion->id_solicitud_transporte !== null
                ) {
                    SolicitudTransporte::findOrFail(
                        $asignacion->id_solicitud_transporte
                    )->update([
                        'matricula' =>
                            $datos['transporte']['matricula'],
                        'id_ruta' =>
                            $datos['transporte']['id_ruta'],
                    ]);
                } else {
                    $solicitud = SolicitudTransporte::create([
                        'matricula' =>
                            $datos['transporte']['matricula'],
                        'id_ruta' =>
                            $datos['transporte']['id_ruta'],
                    ]);

                    $asignacion->id_solicitud_transporte =
                        $solicitud->id_solicitud_transporte;
                }
            }

            $asignacion->save();

            return $this->obtenerPorId(
                $asignacion->id_solicitud_beneficios
            );
        });
    }
}