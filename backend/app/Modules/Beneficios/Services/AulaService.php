<?php

namespace App\Modules\Beneficios\Services;

use App\Modules\Beneficios\Models\Aula;
use App\Modules\Beneficios\Support\EliminaSiNoEstaEnUso;
use Illuminate\Database\Eloquent\Collection;

class AulaService
{
    use EliminaSiNoEstaEnUso;

    /**
     * Obtiene todas las aulas.
     */
    public function listar(): Collection
    {
        return Aula::query()
            ->orderBy('id_aula')
            ->get();
    }

    /**
     * Obtiene un aula por su ID.
     */
    public function obtenerPorId(int $id): Aula
    {
        return Aula::query()
            ->findOrFail($id);
    }

    /**
     * Crea una nueva aula.
     */
    public function crear(array $datos): Aula
    {
        return Aula::create($datos);
    }

    /**
     * Actualiza un aula existente.
     */
    public function actualizar(Aula $aula, array $datos): Aula
    {
        $aula->update($datos);

        return $aula->refresh();
    }

    /**
     * Elimina un aula si no está asignada.
     */
    public function eliminar(Aula $aula): void
    {
        $this->eliminarSiNoEstaEnUso(
            $aula,
            'No se puede eliminar el aula porque está asignada a una o más agrupaciones.'
        );
    }
}