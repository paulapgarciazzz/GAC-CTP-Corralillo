<?php

namespace App\Modules\SolicitudesAgrupaciones\Services;

use App\Modules\SolicitudesAgrupaciones\Models\Encargado;

class EncargadoService
{
    public function buscarPorCedula(string $cedula): ?Encargado
    {
        return Encargado::find($cedula);
    }

    public function crear(array $datos): Encargado
    {
        return Encargado::create($datos);
    }
}