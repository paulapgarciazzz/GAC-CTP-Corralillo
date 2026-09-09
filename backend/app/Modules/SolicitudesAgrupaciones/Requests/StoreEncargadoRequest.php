<?php

namespace App\Modules\SolicitudesAgrupaciones\Requests;

use App\Modules\SolicitudesAgrupaciones\Rules\FormatoIdentificacion;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEncargadoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tipo_identificacion' => [
                'required',
                'string',
                Rule::in(['cedula', 'dimex', 'pasaporte']),
            ],

            'cedula' => [
                'required',
                'string',
                'max:20',
                'unique:encargado,cedula',
                new FormatoIdentificacion(),
            ],

            'primer_nombre' => [
                'required',
                'string',
                'max:100',
            ],

            'apellido' => [
                'required',
                'string',
                'max:100',
            ],

            'email' => [
                'required',
                'email',
                'max:150',
                'unique:encargado,email',
            ],

            'numero_tel' => [
                'required',
                'string',
                'max:20',
                'unique:encargado,numero_tel',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'cedula.unique' => 'Esta cédula ya está registrada. Si ya ha participado anteriormente, seleccione la opción \'Sí, ya he participado\'.',
            'email.unique' => 'Este correo electrónico ya está registrado.',
            'numero_tel.unique' => 'Este número de teléfono ya está registrado.',
        ];
    }
}