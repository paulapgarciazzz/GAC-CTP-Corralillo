<?php

namespace App\Modules\Usuarios\Requests;

use App\Modules\SolicitudesAgrupaciones\Rules\FotoValida;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Datos que cualquier usuario puede cambiar de sí mismo. El estado y el rol
 * no están aquí a propósito: solo se gestionan desde Lista de Usuarios.
 */
class ActualizarPerfilRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => [
                'sometimes',
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($this->user()),
            ],
            'foto' => ['sometimes', 'nullable', 'string', new FotoValida()],
            'password' => ['sometimes', 'nullable', 'string', 'min:8', 'confirmed'],
            'password_actual' => ['required_with:password', 'nullable', 'string'],
        ];
    }
}
