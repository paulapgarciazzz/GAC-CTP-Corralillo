<?php

namespace App\Modules\SolicitudesAgrupaciones\Services;

use App\Modules\SolicitudesAgrupaciones\Models\Estado;
use App\Modules\SolicitudesAgrupaciones\Models\SolicitudAgrupacion;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Symfony\Component\HttpKernel\Exception\HttpException;
use App\Mail\SolicitudAprobadaNotification;
use App\Mail\SolicitudRechazadaNotification;
use Illuminate\Support\Facades\Log;

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
                'fecha_asignada' => $datos['fecha_asignada'] ?? null,
                'hora_asignada' => $datos['hora_asignada'] ?? null,
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
        $solicitud = DB::transaction(function () use ($id, $datos) {
            $solicitud = SolicitudAgrupacion::with('estado')
            ->lockForUpdate()
                ->findOrFail($id);

            if ($solicitud->estado->nom_estado !== 'pendiente') {
                throw new HttpException(
                    422,
                    'Solo se pueden aprobar solicitudes pendientes.'
                );
            }

            $estadoAprobado = Estado::where(
                'nom_estado',
                'aprobada'
            )->firstOrFail();

            $solicitud->update([
                'id_estado' => $estadoAprobado->id,
                'fecha_asignada' => $datos['fecha_asignada'] ?? $solicitud->fecha_asignada,
                'hora_asignada' => $datos['hora_asignada'] ?? $solicitud->hora_asignada,
            ]);

            return $solicitud->fresh([
                'agrupacion.encargado',
                'estado',
                'auditorias',
            ]);
        });

        $this->notificarResultado($solicitud, 'aprobada');

        return $solicitud;
    }

    public function rechazar(int $id): SolicitudAgrupacion
    {
        $solicitud = DB::transaction(function () use ($id) {
            $solicitud = SolicitudAgrupacion::with('estado')
            ->lockForUpdate()
                ->findOrFail($id);

            if ($solicitud->estado->nom_estado !== 'pendiente') {
                throw new HttpException(
                    422,
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

            return $solicitud->fresh([
                'agrupacion.encargado',
                'estado',
                'auditorias',
            ]);
        });

        $this->notificarResultado($solicitud, 'rechazada');

        return $solicitud;
    }

    public function actualizar(int $id, array $datos): SolicitudAgrupacion
    {
        return DB::transaction(function () use ($id, $datos) {
            $solicitud = SolicitudAgrupacion::with('agrupacion.encargado')
                ->lockForUpdate()
                ->findOrFail($id);

            if (!empty($datos['encargado'])) {
                $solicitud->agrupacion->encargado->update($datos['encargado']);
            }

            if (!empty($datos['agrupacion'])) {
                $solicitud->agrupacion->update($datos['agrupacion']);
            }

            if (!empty($datos['solicitud'])) {
                $solicitud->update($datos['solicitud']);
            }

            return $solicitud->fresh([
                'agrupacion.encargado',
                'estado',
                'auditorias',
            ]);
        });
    }

    public function eliminar(int $id): void
    {
        DB::transaction(function () use ($id) {
            $solicitud = SolicitudAgrupacion::findOrFail($id);
            $solicitud->auditorias()->delete();
            $solicitud->delete();
        });
    }

    private function notificarResultado(
        SolicitudAgrupacion $solicitud,
        string $resultado
    ): void {
        try {
            $encargado = $solicitud->agrupacion->encargado;

            if ($resultado === 'aprobada') {
                Mail::to($encargado->email)->send(
                    new SolicitudAprobadaNotification($solicitud)
                );
            } elseif ($resultado === 'rechazada') {
                Mail::to($encargado->email)->send(
                    new SolicitudRechazadaNotification($solicitud)
                );
            }
        } catch (\Exception $e) {
            // Log the error but don't fail the transaction
            // The solicitud state has already been persisted
            Log::error('Error al enviar notificación de solicitud', [
                'solicitud_id' => $solicitud->id,
                'resultado' => $resultado,
                'encargado_email' => $solicitud->agrupacion->encargado->email ?? 'unknown',
                'error' => $e->getMessage(),
            ]);
        }
    }
}