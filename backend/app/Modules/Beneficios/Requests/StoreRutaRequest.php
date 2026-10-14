<?php

namespace App\Modules\Beneficios\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRutaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre_ruta' => [
                'required',
                'string',
                'max:50',
                'unique:ruta,nombre_ruta',
            ],
        ];
    }
}