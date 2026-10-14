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
            'cedula' => ['prohibited'],
            'tipo_identificacion' => ['prohibited'],

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
                Rule::unique('encargado', 'email')
                    ->ignore($this->route('cedula'), 'cedula'),
            ],

            'numero_tel' => [
                'sometimes',
                'required',
                'string',
                'max:20',
                Rule::unique('encargado', 'numero_tel')
                    ->ignore($this->route('cedula'), 'cedula'),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'cedula.prohibited' => 'La cédula no puede modificarse.',
            'tipo_identificacion.prohibited' => 'El tipo de identificación no puede modificarse.',
            'email.unique' => 'Este correo electrónico ya está registrado.',
            'numero_tel.unique' => 'Este número de teléfono ya está registrado.',
        ];
    }
}
