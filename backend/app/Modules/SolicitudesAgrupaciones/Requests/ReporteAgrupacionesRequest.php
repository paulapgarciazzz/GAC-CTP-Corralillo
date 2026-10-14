<?php

namespace App\Modules\SolicitudesAgrupaciones\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReporteAgrupacionesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id_evento' => ['sometimes', 'nullable', 'integer', 'exists:evento,id_evento'],
        ];
    }
}
