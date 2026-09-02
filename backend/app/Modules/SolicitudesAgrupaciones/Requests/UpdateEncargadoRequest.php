<?php

namespace App\Modules\SolicitudesAgrupaciones\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEncargadoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // 'cedula' y 'tipo_identificacion' no se incluyen a propósito: son inmutables
        // una vez creado el encargado (cedula es la primary key de la tabla).
        return [
            'primer_nombre' => [
                'sometimes',
                'required',
                'string',
                'max:100',
            ],

            'apellido' => [
                'sometimes',
                'required',
                'string',
                'max:100',
            ],

            'email' => [
                'sometimes',
                'required',
                'email',
                'max:150',
                Rule::unique('encargado', 'email')->ignore($this->route('cedula'), 'cedula'),
            ],

            'numero_tel' => [
                'sometimes',
                'required',
                'string',
                'max:20',
            ],
        ];
    }
}
