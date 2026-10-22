<?php

namespace App\Modules\Conteo\Controllers;

use App\Modules\Conteo\Requests\ConteoReportRequest;
use App\Modules\Conteo\Resources\ConteoReportResource;
use App\Modules\Conteo\Services\ConteoReportService;

class ConteoReportController
{
    public function __construct(
        private readonly ConteoReportService $conteoReportService
    ) {
    }

    public function index(ConteoReportRequest $request): ConteoReportResource
    {
        return new ConteoReportResource(
            $this->conteoReportService->generar($request->validated()['fecha'])
        );
    }
}
