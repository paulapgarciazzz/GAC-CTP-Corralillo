<?php

namespace App\Modules\SolicitudesAgrupaciones\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAgrupacionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'ced_encargado' => [
                'required',
                'string',
                'max:20',
                'exists:encargado,cedula',
            ],

            'nombre' => [
                'required',
                'string',
                'max:150',
            ],

            'lugar_procedencia' => [
                'required',
                'string',
                'max:150',
            ],

            'cantidad_integrantes' => [
                'required',
                'integer',
                'min:1',
            ],

            'resena' => [
                'nullable',
                'string',
                'max:5000',
            ],
        ];
    }
}