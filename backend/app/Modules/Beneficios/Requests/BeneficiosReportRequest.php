<?php

namespace App\Modules\Beneficios\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BeneficiosReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'fecha_desde' => ['required', 'date'],
            'fecha_hasta' => ['required', 'date', 'after_or_equal:fecha_desde'],
            'categoria' => ['sometimes', 'in:todos,alimentacion,mobiliario,aula,transporte'],
            'tipo_alimentacion' => ['sometimes', 'nullable', 'string', 'exists:alimentacion,tiempo_comida'],
        ];
    }
}
