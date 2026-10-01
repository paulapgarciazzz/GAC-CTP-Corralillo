<?php

namespace App\Modules\Calendario\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreUbicacionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre' => [
                'required',
                'string',
                'max:100',
                'unique:ubicacion,nombre',
            ],
            'descripcion' => [
                'nullable',
                'string',
                'max:1000',
            ],
            'capacidad' => [
                'required',
                'integer',
                'min:1',
            ],
            'imagen' => [
                'nullable',
                'string',
                'starts_with:data:image/',
            ],
        ];
    }
}
