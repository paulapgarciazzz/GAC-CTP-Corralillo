<?php

namespace App\Modules\Usuarios\Requests;

use App\Modules\Usuarios\Support\Modulos;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SincronizarPermisosRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'permisos' => ['present', 'array'],
            'permisos.*' => ['string', 'distinct', Rule::in(Modulos::permisos())],
        ];
    }
}
