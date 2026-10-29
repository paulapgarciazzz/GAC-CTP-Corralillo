<?php

namespace App\Modules\Usuarios\Requests;

use App\Modules\Usuarios\Support\MensajesValidacion;
use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    use MensajesValidacion;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ];
    }
}
