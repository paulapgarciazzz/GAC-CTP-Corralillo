<?php

namespace App\Modules\SolicitudesAgrupaciones\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEncargadoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'cedula' => [
                'required',
                'string',
                'max:20',
                'unique:encargado,cedula',
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
            ],
        ];
    }
}