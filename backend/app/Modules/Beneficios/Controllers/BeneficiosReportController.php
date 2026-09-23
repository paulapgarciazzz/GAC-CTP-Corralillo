<?php

namespace App\Modules\Beneficios\Controllers;

use App\Modules\Beneficios\Requests\BeneficiosReportRequest;
use App\Modules\Beneficios\Resources\BeneficiosReportResource;
use App\Modules\Beneficios\Services\BeneficiosReportService;

class BeneficiosReportController
{
    public function __construct(private readonly BeneficiosReportService $service) {}

    public function index(BeneficiosReportRequest $request): BeneficiosReportResource
    {
        return new BeneficiosReportResource(
            $this->service->generar($request->validated())
        );
    }
}
