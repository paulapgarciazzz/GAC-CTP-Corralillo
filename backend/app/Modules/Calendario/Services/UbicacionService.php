<?php

namespace App\Modules\Calendario\Services;

use App\Modules\Calendario\Models\Ubicacion;
use Illuminate\Database\Eloquent\Collection;

class UbicacionService
{
    /**
     * Obtiene todas las ubicaciones.
     */
    public function listar(): Collection
    {
        return Ubicacion::query()
            ->orderBy('nombre')
            ->get();
    }

    /**
     * Obtiene una ubicación por su ID.
     */
    public function obtenerPorId(int $id): Ubicacion
    {
        return Ubicacion::query()
            ->findOrFail($id);
    }

    /**
     * Crea una nueva ubicación.
     */
    public function crear(array $datos): Ubicacion
    {
        return Ubicacion::create($datos)->refresh();
    }

    /**
     * Actualiza una ubicación existente.
     */
    public function actualizar(Ubicacion $ubicacion, array $datos): Ubicacion
    {
        $ubicacion->update($datos);

        return $ubicacion->refresh();
    }

    /**
     * Elimina una ubicación. Sus actividades quedan sin ubicación (FK nullOnDelete).
     */
    public function eliminar(Ubicacion $ubicacion): void
    {
        $ubicacion->delete();
    }
}
