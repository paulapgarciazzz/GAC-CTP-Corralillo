<?php

namespace App\Modules\SolicitudesAgrupaciones\Services;

use App\Modules\SolicitudesAgrupaciones\Models\Estado;
use App\Modules\SolicitudesAgrupaciones\Models\SolicitudAgrupacion;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class SolicitudAgrupacionService
{
    public function listar(): Collection
    {
        return SolicitudAgrupacion::with([
            'agrupacion.encargado',
            'estado',
            'auditorias',
        ])->get();
    }

    public function buscarPorId(int $id): SolicitudAgrupacion
    {
        return SolicitudAgrupacion::with([
            'agrupacion.encargado',
            'agrupacion.participaciones',
            'estado',
            'auditorias',
        ])->findOrFail($id);
    }

    public function crear(array $datos): SolicitudAgrupacion
    {
        return DB::transaction(function () use ($datos) {
            $estadoPendiente = Estado::where(
                'nom_estado',
                'pendiente'
            )->firstOrFail();

            $solicitud = SolicitudAgrupacion::create([
                'id_agrupacion' => $datos['id_agrupacion'],
                'fecha_solicitud' => $datos['fecha_solicitud'],
                'id_estado' => $estadoPendiente->id,
                'comentarios' => $datos['comentarios'] ?? null,
            ]);

            return $solicitud->load([
                'agrupacion.encargado',
                'estado',
            ]);
        });
    }

    public function aprobar(
        int $id,
        array $datos
    ): SolicitudAgrupacion {
        return DB::transaction(function () use ($id, $datos) {
            $solicitud = SolicitudAgrupacion::with('estado')
                ->findOrFail($id);

            if ($solicitud->estado->nom_estado !== 'pendiente') {
                throw new RuntimeException(
                    'Solo se pueden aprobar solicitudes pendientes.'
                );
            }

            $estadoAprobado = Estado::where(
                'nom_estado',
                'aprobada'
            )->firstOrFail();

            $solicitud->update([
                'id_estado' => $estadoAprobado->id,
                'fecha_asignada' => $datos['fecha_asignada'],
                'hora_asignada' => $datos['hora_asignada'],
            ]);

            return $solicitud->fresh([
                'agrupacion.encargado',
                'estado',
                'auditorias',
            ]);
        });
    }

    public function rechazar(int $id): SolicitudAgrupacion
    {
        return DB::transaction(function () use ($id) {
            $solicitud = SolicitudAgrupacion::with('estado')
                ->findOrFail($id);

            if ($solicitud->estado->nom_estado !== 'pendiente') {
                throw new RuntimeException(
                    'Solo se pueden rechazar solicitudes pendientes.'
                );
            }

            $estadoRechazado = Estado::where(
                'nom_estado',
                'rechazada'
            )->firstOrFail();

            $solicitud->update([
                'id_estado' => $estadoRechazado->id,
                'fecha_asignada' => null,
                'hora_asignada' => null,
            ]);

            // Más adelante aquí enviaremos el correo al encargado.

            return $solicitud->fresh([
                'agrupacion.encargado',
                'estado',
                'auditorias',
            ]);
        });
    }
}