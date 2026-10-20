<?php

namespace App\Modules\Personalizacion\Patrocinadores\Services;

use App\Modules\Personalizacion\Patrocinadores\Models\ConfiguracionPatrocinadores;

class ConfiguracionPatrocinadoresService
{
    /**
     * Obtiene la configuración de la sección, creándola con valores por
     * defecto si todavía no existe (tabla pensada para una sola fila).
     */
    public function obtener(): ConfiguracionPatrocinadores
    {
        return ConfiguracionPatrocinadores::query()->firstOrCreate([]);
    }

    public function actualizar(array $datos): ConfiguracionPatrocinadores
    {
        $configuracion = $this->obtener();
        $configuracion->update($datos);

        return $configuracion->refresh();
    }
}
