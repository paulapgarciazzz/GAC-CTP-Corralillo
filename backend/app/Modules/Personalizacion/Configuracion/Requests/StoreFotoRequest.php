<?php

namespace App\Modules\Personalizacion\Configuracion\Requests;

use App\Modules\Personalizacion\Configuracion\Models\FotoPersonalizacion;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreFotoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'destino' => ['required', 'string', Rule::in(FotoPersonalizacion::DESTINOS)],
            'archivo' => ['required', 'image', 'mimes:png,jpg,jpeg,webp', 'max:4096'],
            'titulo' => ['nullable', 'string', 'max:150'],
            'activo' => ['nullable', 'boolean'],
        ];
    }
}
