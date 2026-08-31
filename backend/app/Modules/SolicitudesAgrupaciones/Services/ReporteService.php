<?php

namespace App\Modules\SolicitudesAgrupaciones\Services;

use App\Modules\SolicitudesAgrupaciones\Models\SolicitudAgrupacion;

class ReporteService
{
    public function obtenerReporteAgrupaciones(): array
    {
        return [
            'recibidas' => SolicitudAgrupacion::count(),
            'aceptadas' => SolicitudAgrupacion::whereHas(
                'estado',
                fn ($query) => $query->where('nom_estado', 'aprobada')
            )->count(),
            'rechazadas' => SolicitudAgrupacion::whereHas(
                'estado',
                fn ($query) => $query->where('nom_estado', 'rechazada')
            )->count(),
            'pendientes' => SolicitudAgrupacion::whereHas(
                'estado',
                fn ($query) => $query->where('nom_estado', 'pendiente')
            )->count(),
            'porMes' => $this->obtenerSolicitudesPorMes(),
        ];
    }

    private function obtenerSolicitudesPorMes(): array
    {
        return SolicitudAgrupacion::selectRaw("DATE_FORMAT(fecha_solicitud, '%Y-%m') as mes, COUNT(*) as total")
            ->groupBy('mes')
            ->orderBy('mes')
            ->get()
            ->map(fn ($fila) => ['mes' => $fila->mes, 'total' => (int) $fila->total])
            ->toArray();
    }
}
