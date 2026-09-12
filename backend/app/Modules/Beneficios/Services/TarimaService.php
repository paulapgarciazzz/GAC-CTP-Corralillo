<?php

namespace App\Modules\Beneficios\Services;

use App\Modules\Beneficios\Models\Tarima;
use Illuminate\Database\Eloquent\Collection;

class TarimaService
{
    /**
     * Obtiene todas las tarimas.
     */
    public function listar(): Collection
    {
        return Tarima::query()
            ->orderBy('id_tarima')
            ->get();
    }

    /**
     * Obtiene una tarima por su ID.
     */
    public function obtenerPorId(int $id): Tarima
    {
        return Tarima::query()
            ->findOrFail($id);
    }

    /**
     * Crea una nueva tarima.
     */
    public function crear(array $datos): Tarima
    {
        return Tarima::create($datos);
    }

    /**
     * Actualiza una tarima existente.
     */
    public function actualizar(Tarima $tarima, array $datos): Tarima
    {
        $tarima->update($datos);

        return $tarima->refresh();
    }

    /**
     * Elimina una tarima.
     */
    public function eliminar(Tarima $tarima): void
    {
        $tarima->delete();
    }
}