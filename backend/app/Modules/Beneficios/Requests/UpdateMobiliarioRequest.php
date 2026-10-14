<?php

namespace App\Modules\Beneficios\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMobiliarioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $idMobiliario = $this->route('mobiliario');

        return [
            'nombre' => [
                'sometimes',
                'required',
                'string',
                'max:100',
                Rule::unique('mobiliario', 'nombre')
                    ->ignore($idMobiliario, 'id_mobiliario'),
            ],
            'cantidad_disponible' => [
                'sometimes',
                'nullable',
                'integer',
                'min:0',
            ],
            'encargado' => [
                'sometimes',
                'nullable',
                'string',
                'max:150',
            ],
        ];
    }
}