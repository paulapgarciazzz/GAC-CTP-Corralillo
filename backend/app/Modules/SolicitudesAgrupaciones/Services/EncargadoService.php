<?php

namespace App\Modules\SolicitudesAgrupaciones\Services;

use App\Modules\SolicitudesAgrupaciones\Models\Agrupacion;
use App\Modules\SolicitudesAgrupaciones\Models\Auditoria;
use App\Modules\SolicitudesAgrupaciones\Models\Encargado;
use App\Modules\SolicitudesAgrupaciones\Models\SolicitudAgrupacion;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class EncargadoService
{
    public function listarAdministrativa(): Collection
    {
        return Encargado::withCount('agrupaciones')
            ->withCount('solicitudes')
            ->get();
    }

    public function buscarPorCedula(string $cedula): ?Encargado
    {
        return Encargado::find($cedula);
    }

    public function crear(array $datos): Encargado
    {
        return Encargado::create($datos);
    }

    public function actualizar(Encargado $encargado, array $datos): Encargado
    {
        $encargado->update($datos);

        return $encargado->fresh();
    }

    public function eliminar(Encargado $encargado): void
    {
        DB::transaction(function () use ($encargado) {
            $agrupaciones = $encargado->agrupaciones()->get();
            $idsAgrupaciones = $agrupaciones->pluck('id')->all();

            if (! empty($idsAgrupaciones)) {
                $idsSolicitudes = SolicitudAgrupacion::whereIn('id_agrupacion', $idsAgrupaciones)
                    ->pluck('id')
                    ->all();

                if (! empty($idsSolicitudes)) {
                    Auditoria::whereIn('id_solicitud', $idsSolicitudes)->delete();
                    SolicitudAgrupacion::whereIn('id_agrupacion', $idsAgrupaciones)->delete();
                }

                $encargado->agrupaciones()->each(function (Agrupacion $agrupacion) {
                    $agrupacion->participaciones()->delete();
                });

                $encargado->agrupaciones()->delete();
            }

            $encargado->delete();
        });
    }
}