<?php

namespace App\Modules\Beneficios\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAlimentacionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tiempo_comida' => [
                'required',
                'string',
                'max:100',
                'unique:alimentacion,tiempo_comida',
            ],
        ];
    }
}