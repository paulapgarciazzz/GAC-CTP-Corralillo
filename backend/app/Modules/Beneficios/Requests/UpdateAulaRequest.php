<?php

namespace App\Modules\Beneficios\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAulaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $idAula = $this->route('aula');

        return [
            'nombre' => [
                'sometimes',
                'required',
                'string',
                'max:100',
                Rule::unique('aula', 'nombre')
                    ->ignore($idAula, 'id_aula'),
            ],
            'capacidad' => [
                'sometimes',
                'required',
                'integer',
                'min:1',
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