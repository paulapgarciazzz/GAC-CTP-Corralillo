<?php

namespace App\Modules\Beneficios\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTransporteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'matricula' => [
                'required',
                'string',
                'max:6',
                'unique:transporte,matricula',
            ],

            'tipo' => [
                'required',
                'string',
                'max:20',
            ],

            'capacidad' => [
                'required',
                'integer',
                'min:1',
            ],

            'cedula_conductor' => [
                'required',
                'string',
                'max:10',
            ],

            'nombre_conductor' => [
                'required',
                'string',
                'max:100',
            ],

            'apellido_conductor' => [
                'required',
                'string',
                'max:100',
            ],
        ];
    }
}