<?php

namespace App\Modules\Beneficios\Services;

use App\Modules\Beneficios\Models\Alimentacion;
use App\Modules\Beneficios\Models\Aula;
use App\Modules\Beneficios\Models\Mobiliario;
use App\Modules\Beneficios\Models\Transporte;

class InventarioReportService
{
    public function generar(): array
    {
        $porTipo = [
            ['tipo' => 'alimentacion', 'etiqueta' => 'Alimentación', 'total' => Alimentacion::count()],
            ['tipo' => 'mobiliario', 'etiqueta' => 'Mobiliario', 'total' => Mobiliario::count()],
            ['tipo' => 'aula', 'etiqueta' => 'Aulas', 'total' => Aula::count()],
            ['tipo' => 'transporte', 'etiqueta' => 'Transporte', 'total' => Transporte::count()],
        ];

        return [
            'total_items' => array_sum(array_column($porTipo, 'total')),
            'por_tipo' => $porTipo,
            'mobiliario_unidades' => (int) Mobiliario::sum('cantidad_disponible'),
        ];
    }
}
