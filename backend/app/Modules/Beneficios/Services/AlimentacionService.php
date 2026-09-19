<?php

namespace App\Modules\Beneficios\Services;

use App\Modules\Beneficios\Models\Alimentacion;
use Illuminate\Database\Eloquent\Collection;

class AlimentacionService
{
    /**
     * Obtiene todos los tipos de alimentación.
     */
    public function listar(): Collection
    {
        return Alimentacion::query()
            ->orderBy('id_alimentacion')
            ->get();
    }

    /**
     * Obtiene un tipo de alimentación por su ID.
     */
    public function obtenerPorId(int $id): Alimentacion
    {
        return Alimentacion::query()
            ->findOrFail($id);
    }

    /**
     * Crea un nuevo tipo de alimentación.
     */
    public function crear(array $datos): Alimentacion
    {
        return Alimentacion::create($datos);
    }

    /**
     * Actualiza un tipo de alimentación existente.
     */
    public function actualizar(Alimentacion $alimentacion, array $datos): Alimentacion
    {
        $alimentacion->update($datos);

        return $alimentacion->refresh();
    }

    /**
     * Elimina un tipo de alimentación.
     */
    public function eliminar(Alimentacion $alimentacion): void
    {
        $alimentacion->delete();
    }
}