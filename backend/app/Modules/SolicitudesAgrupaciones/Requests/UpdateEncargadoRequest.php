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
