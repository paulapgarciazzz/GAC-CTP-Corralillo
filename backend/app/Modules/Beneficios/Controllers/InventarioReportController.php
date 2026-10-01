<?php

namespace App\Modules\Beneficios\Controllers;

use App\Modules\Beneficios\Resources\BeneficiosReportResource;
use App\Modules\Beneficios\Services\InventarioReportService;

class InventarioReportController
{
    public function __construct(private readonly InventarioReportService $service) {}

    public function index(): BeneficiosReportResource
    {
        return new BeneficiosReportResource($this->service->generar());
    }
}
