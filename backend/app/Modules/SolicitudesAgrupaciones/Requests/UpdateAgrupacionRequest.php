<?php

namespace App\Modules\SolicitudesAgrupaciones\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAgrupacionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre' => [
                'sometimes',
                'required',
                'string',
                'max:150',
            ],

            'lugar_procedencia' => [
                'sometimes',
                'required',
                'string',
                'max:150',
            ],

            'cantidad_integrantes' => [
                'sometimes',
                'required',
                'integer',
                'min:1',
            ],

            'resena' => [
                'sometimes',
                'nullable',
                'string',
            ],
        ];
    }
}