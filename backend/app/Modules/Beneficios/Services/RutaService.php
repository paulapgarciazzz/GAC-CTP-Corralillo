<?php

namespace App\Modules\Beneficios\Services;

use App\Modules\Beneficios\Models\Ruta;
use Illuminate\Database\Eloquent\Collection;

class RutaService
{
    /**
     * Obtiene todas las rutas.
     */
    public function listar(): Collection
    {
        return Ruta::query()
            ->orderBy('id_ruta')
            ->get();
    }

    /**
     * Obtiene una ruta por su ID.
     */
    public function obtenerPorId(int $id): Ruta
    {
        return Ruta::query()
            ->findOrFail($id);
    }

    /**
     * Crea una nueva ruta.
     */
    public function crear(array $datos): Ruta
    {
        return Ruta::create($datos);
    }

    /**
     * Actualiza una ruta existente.
     */
    public function actualizar(Ruta $ruta, array $datos): Ruta
    {
        $ruta->update($datos);

        return $ruta->refresh();
    }

    /**
     * Elimina una ruta.
     */
    public function eliminar(Ruta $ruta): void
    {
        $ruta->delete();
    }
}