<?php

namespace App\Modules\Personalizacion\Configuracion\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateFotoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'archivo' => ['nullable', 'image', 'mimes:png,jpg,jpeg,webp', 'max:4096'],
            'titulo' => ['nullable', 'string', 'max:150'],
            'activo' => ['nullable', 'boolean'],
        ];
    }
}
