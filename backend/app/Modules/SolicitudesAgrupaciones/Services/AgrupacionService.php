<?php

namespace App\Modules\SolicitudesAgrupaciones\Services;

use App\Modules\SolicitudesAgrupaciones\Models\Agrupacion;
use App\Modules\SolicitudesAgrupaciones\Models\Participacion;
use App\Modules\SolicitudesAgrupaciones\Support\DataUri;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\HttpException;

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

    public function listarAprobadas(): Collection
    {
        return Agrupacion::whereHas('solicitudes', function ($query) {
            $query->whereHas('estado', function ($query) {
                $query->where('nom_estado', 'aprobada');
            });
        })
            ->with(['encargado', 'participaciones'])
            ->get();
    }

    public function actualizar(Agrupacion $agrupacion, array $datos): Agrupacion
    {
        $agrupacion->update($datos);

        return $agrupacion->fresh();
    }

    public function eliminar(Agrupacion $agrupacion): void
    {
        DB::transaction(function () use ($agrupacion) {
            foreach ($agrupacion->solicitudes as $solicitud) {
                $solicitud->auditorias()->delete();
            }

            $agrupacion->solicitudes()->delete();
            $agrupacion->participaciones()->delete();
            $agrupacion->delete();
        });
    }

    /**
     * @return array{mime: string, binario: string}
     */
    public function obtenerArchivoAdjunto(Agrupacion $agrupacion): array
    {
        $datos = DataUri::parse($agrupacion->archivo_adjunto);

        if ($datos === null) {
            throw new HttpException(404, 'Esta agrupación no tiene un archivo adjunto.');
        }

        return $datos;
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