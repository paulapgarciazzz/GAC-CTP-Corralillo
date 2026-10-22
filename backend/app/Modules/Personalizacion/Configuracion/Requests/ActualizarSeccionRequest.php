<?php

namespace App\Modules\Personalizacion\Configuracion\Requests;

use App\Modules\Personalizacion\Configuracion\Support\Predeterminados;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Textos de una sección (landing, correos, apariencia o contacto). Las
 * reglas viven en Predeterminados para que valores y validación no se separen.
 */
class ActualizarSeccionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return Predeterminados::reglas($this->route('seccion'));
    }

    public function messages(): array
    {
        return [
            '*.regex' => 'El formato no es válido.',
            'color_*.regex' => 'El color debe tener el formato #RRGGBB.',
        ];
    }
}
