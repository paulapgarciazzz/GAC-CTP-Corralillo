<?php

namespace App\Modules\Usuarios\Requests;

use App\Modules\Usuarios\Support\MensajesValidacion;
use Illuminate\Foundation\Http\FormRequest;

class StoreUsuarioRequest extends FormRequest
{
    use MensajesValidacion;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'activo' => ['sometimes', 'boolean'],
            'es_admin' => ['sometimes', 'boolean'],
        ];
    }
}
