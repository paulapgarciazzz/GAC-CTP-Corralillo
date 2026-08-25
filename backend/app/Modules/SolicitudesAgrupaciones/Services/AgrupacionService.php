<?php

namespace App\Modules\SolicitudesAgrupaciones\Services;

use App\Modules\SolicitudesAgrupaciones\Models\Agrupacion;
use App\Modules\SolicitudesAgrupaciones\Models\Participacion;
use Illuminate\Database\Eloquent\Collection;

class AgrupacionService
{
    public function crear(array $datos): Agrupacion
    {
        return Agrupacion::create($datos);
    }

    public function buscarPorId(int $id): ?Agrupacion
    {
        return Agrupacion::find($id);
    }

    public function obtenerPorEncargado(string $cedula): Collection
    {
        return Agrupacion::where('ced_encargado', $cedula)
            ->with('participaciones')
            ->get();
    }

    public function actualizar(Agrupacion $agrupacion, array $datos): Agrupacion
    {
        $agrupacion->update($datos);

        return $agrupacion->fresh();
    }

    public function agregarParticipacion(
        Agrupacion $agrupacion,
        array $datos
    ): Participacion {
        return $agrupacion->participaciones()->create([
            'lugar' => $datos['lugar'],
            'fecha' => $datos['fecha'],
        ]);
    }
}