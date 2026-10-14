<?php

namespace App\Modules\SolicitudesAgrupaciones\Services;

use App\Modules\SolicitudesAgrupaciones\Models\SolicitudAgrupacion;
use Illuminate\Database\Eloquent\Builder;

class ReporteService
{
    /**
     * Resumen de solicitudes; si se indica un evento, solo cuenta las de ese evento.
     */
    public function obtenerReporteAgrupaciones(?int $idEvento = null): array
    {
        return [
            'recibidas' => $this->solicitudes($idEvento)->count(),
            'aceptadas' => $this->contarPorEstado($idEvento, 'aprobada'),
            'rechazadas' => $this->contarPorEstado($idEvento, 'rechazada'),
            'pendientes' => $this->contarPorEstado($idEvento, 'pendiente'),
            'porMes' => $this->obtenerSolicitudesPorMes($idEvento),
        ];
    }

    private function solicitudes(?int $idEvento): Builder
    {
        return SolicitudAgrupacion::query()
            ->when($idEvento, fn (Builder $query) => $query->where('id_evento', $idEvento));
    }

    private function contarPorEstado(?int $idEvento, string $estado): int
    {
        return $this->solicitudes($idEvento)
            ->whereHas('estado', fn ($query) => $query->where('nom_estado', $estado))
            ->count();
    }

    private function obtenerSolicitudesPorMes(?int $idEvento): array
    {
        return $this->solicitudes($idEvento)
            ->selectRaw("DATE_FORMAT(fecha_solicitud, '%Y-%m') as mes, COUNT(*) as total")
            ->groupBy('mes')
            ->orderBy('mes')
            ->get()
            ->map(fn ($fila) => ['mes' => $fila->mes, 'total' => (int) $fila->total])
            ->toArray();
    }
}
