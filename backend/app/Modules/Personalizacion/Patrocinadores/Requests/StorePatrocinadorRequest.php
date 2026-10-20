<?php

namespace App\Modules\Personalizacion\Patrocinadores\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePatrocinadorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre' => [
                'required',
                'string',
                'max:150',
            ],
            'logotipo' => [
                'required',
                'image',
                'mimes:png,jpg,jpeg,webp',
                'max:2048',
            ],
            'descripcion' => [
                'nullable',
                'string',
                'max:1000',
            ],
            'enlace' => [
                'nullable',
                'url',
                'max:255',
            ],
            'categoria' => [
                'nullable',
                'string',
                Rule::in(['principal', 'oro', 'plata', 'colaborador']),
            ],
            'orden' => [
                'nullable',
                'integer',
                'min:0',
            ],
            'activo' => [
                'nullable',
                'boolean',
            ],
        ];
    }
}
