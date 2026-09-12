<?php

namespace App\Modules\Beneficios\Services;

use App\Modules\Beneficios\Models\Mobiliario;
use Illuminate\Database\Eloquent\Collection;

class MobiliarioService
{
    /**
     * Obtiene todo el mobiliario.
     */
    public function listar(): Collection
    {
        return Mobiliario::query()
            ->orderBy('id_mobiliario')
            ->get();
    }

    /**
     * Obtiene un mobiliario por su ID.
     */
    public function obtenerPorId(int $id): Mobiliario
    {
        return Mobiliario::query()
            ->findOrFail($id);
    }

    /**
     * Crea un nuevo mobiliario.
     */
    public function crear(array $datos): Mobiliario
    {
        return Mobiliario::create($datos);
    }

    /**
     * Actualiza un mobiliario existente.
     */
    public function actualizar(Mobiliario $mobiliario, array $datos): Mobiliario
    {
        $mobiliario->update($datos);

        return $mobiliario->refresh();
    }

    /**
     * Elimina un mobiliario.
     */
    public function eliminar(Mobiliario $mobiliario): void
    {
        $mobiliario->delete();
    }
}