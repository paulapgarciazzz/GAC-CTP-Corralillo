<?php

namespace App\Modules\Beneficios\Services;

use App\Modules\Beneficios\Models\Transporte;
use Illuminate\Database\Eloquent\Collection;

class TransporteService
{
    /**
     * Obtiene todos los transportes.
     */
    public function listar(): Collection
    {
        return Transporte::query()
            ->orderBy('matricula')
            ->get();
    }

    /**
     * Obtiene un transporte por su matrícula.
     */
    public function obtenerPorMatricula(string $matricula): Transporte
    {
        return Transporte::query()
            ->findOrFail($matricula);
    }

    /**
     * Crea un nuevo transporte.
     */
    public function crear(array $datos): Transporte
    {
        return Transporte::create($datos);
    }

    /**
     * Actualiza un transporte existente.
     */
    public function actualizar(Transporte $transporte, array $datos): Transporte
    {
        $transporte->update($datos);

        return $transporte->refresh();
    }

    /**
     * Elimina un transporte.
     */
    public function eliminar(Transporte $transporte): void
    {
        $transporte->delete();
    }
}