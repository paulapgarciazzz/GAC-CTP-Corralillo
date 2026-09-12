<?php

namespace App\Modules\Beneficios\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTransporteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // La matrícula identifica el transporte y no la
            // modificaremos desde este Request.
            'matricula' => [
                'prohibited',
            ],

            'tipo' => [
                'sometimes',
                'required',
                'string',
                'max:20',
            ],

            'capacidad' => [
                'sometimes',
                'required',
                'integer',
                'min:1',
            ],

            'cedula_conductor' => [
                'sometimes',
                'required',
                'string',
                'max:10',
            ],

            'nombre_conductor' => [
                'sometimes',
                'required',
                'string',
                'max:100',
            ],

            'apellido_conductor' => [
                'sometimes',
                'required',
                'string',
                'max:100',
            ],
        ];
    }
}