<?php

namespace App\Modules\Calendario\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUbicacionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $ubicacion = $this->route('ubicacion');

        return [
            'nombre' => [
                'sometimes',
                'required',
                'string',
                'max:100',
                Rule::unique('ubicacion', 'nombre')
                    ->ignore($ubicacion, 'id_ubicacion'),
            ],
            'descripcion' => [
                'sometimes',
                'nullable',
                'string',
                'max:1000',
            ],
            'capacidad' => [
                'sometimes',
                'required',
                'integer',
                'min:1',
            ],
            'imagen' => [
                'sometimes',
                'nullable',
                'string',
                'starts_with:data:image/',
            ],
        ];
    }
}
