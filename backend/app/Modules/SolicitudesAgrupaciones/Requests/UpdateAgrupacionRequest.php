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
            'id' => ['prohibited'],
            'ced_encargado' => ['prohibited'],
            'nombre' => ['prohibited'],

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
                'max:5000',
            ],

            'foto_url' => [
                'sometimes',
                'nullable',
                'string',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'id.prohibited' => 'El identificador no puede modificarse.',
            'ced_encargado.prohibited' => 'El encargado asociado no puede modificarse.',
            'nombre.prohibited' => 'El nombre no puede modificarse.',
        ];
    }
}