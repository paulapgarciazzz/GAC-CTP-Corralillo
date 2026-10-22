<?php

namespace App\Modules\Conteo\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConteoReportResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return $this->resource;
    }
}
