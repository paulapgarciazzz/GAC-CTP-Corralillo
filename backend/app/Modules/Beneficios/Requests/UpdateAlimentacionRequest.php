<?php

namespace App\Modules\Beneficios\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAlimentacionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $idAlimentacion = $this->route('id');

        return [
            'tiempo_comida' => [
                'sometimes',
                'required',
                'string',
                'max:100',
                Rule::unique('alimentacion', 'tiempo_comida')
                    ->ignore($idAlimentacion, 'id_alimentacion'),
            ],
        ];
    }
}