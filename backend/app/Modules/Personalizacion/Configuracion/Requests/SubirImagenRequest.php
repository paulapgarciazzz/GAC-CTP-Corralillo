<?php

namespace App\Modules\Personalizacion\Configuracion\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SubirImagenRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Sin SVG: puede contener scripts y muchos clientes de correo no lo muestran.
            'imagen' => ['required', 'image', 'mimes:png,jpg,jpeg,webp', 'max:2048'],
        ];
    }
}
