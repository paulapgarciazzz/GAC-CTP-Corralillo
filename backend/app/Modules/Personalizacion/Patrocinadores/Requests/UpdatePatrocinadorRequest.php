<?php

namespace App\Modules\Personalizacion\Patrocinadores\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePatrocinadorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre' => [
                'sometimes',
                'required',
                'string',
                'max:150',
            ],
            'logotipo' => [
                'sometimes',
                'nullable',
                'image',
                'mimes:png,jpg,jpeg,webp',
                'max:2048',
            ],
            'descripcion' => [
                'sometimes',
                'nullable',
                'string',
                'max:1000',
            ],
            'enlace' => [
                'sometimes',
                'nullable',
                'url',
                'max:255',
            ],
            'categoria' => [
                'sometimes',
                'nullable',
                'string',
                Rule::in(['principal', 'oro', 'plata', 'colaborador']),
            ],
            'orden' => [
                'sometimes',
                'integer',
                'min:0',
            ],
            'activo' => [
                'sometimes',
                'boolean',
            ],
        ];
    }
}
