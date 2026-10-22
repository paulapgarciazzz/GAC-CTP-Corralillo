<?php

namespace App\Modules\Personalizacion\Configuracion\Requests;

use App\Modules\Personalizacion\Configuracion\Support\Predeterminados;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Vista previa de un correo con los textos del formulario (aún sin guardar).
 */
class VistaPreviaCorreoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tipo' => ['required', 'string', Rule::in(Predeterminados::TIPOS_CORREO)],
            'textos' => ['required', 'array'],
            ...Predeterminados::reglasCorreo('textos.'),
        ];
    }
}
