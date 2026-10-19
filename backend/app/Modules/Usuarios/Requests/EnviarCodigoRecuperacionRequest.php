<?php

namespace App\Modules\Usuarios\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EnviarCodigoRecuperacionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'email'],
        ];
    }
}
