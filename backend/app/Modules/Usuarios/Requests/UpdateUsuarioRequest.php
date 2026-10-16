<?php

namespace App\Modules\Usuarios\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUsuarioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $usuario = $this->route('usuario');

        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => [
                'sometimes',
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($usuario),
            ],
            'password' => ['sometimes', 'nullable', 'string', 'min:8'],
            'activo' => ['sometimes', 'boolean'],
            'es_admin' => ['sometimes', 'boolean'],
        ];
    }
}
