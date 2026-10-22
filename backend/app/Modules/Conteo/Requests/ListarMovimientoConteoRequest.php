<?php

namespace App\Modules\Conteo\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ListarMovimientoConteoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'fecha' => ['sometimes', 'nullable', 'date'],
            'tipo' => ['sometimes', 'nullable', 'in:entrada,salida'],
            'per_page' => ['sometimes', 'nullable', 'integer', 'min:1', 'max:100'],
        ];
    }
}
