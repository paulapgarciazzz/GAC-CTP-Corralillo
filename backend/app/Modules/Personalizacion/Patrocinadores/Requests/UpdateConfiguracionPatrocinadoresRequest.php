<?php

namespace App\Modules\Personalizacion\Patrocinadores\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateConfiguracionPatrocinadoresRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'titulo' => [
                'required',
                'string',
                'max:255',
            ],
            'descripcion' => [
                'nullable',
                'string',
                'max:1000',
            ],
        ];
    }
}
