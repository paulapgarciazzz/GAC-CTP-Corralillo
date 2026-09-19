<?php

namespace App\Modules\Beneficios\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRutaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $idRuta = $this->route('id');

        return [
            'nombre_ruta' => [
                'sometimes',
                'required',
                'string',
                'max:50',
                Rule::unique('ruta', 'nombre_ruta')
                    ->ignore($idRuta, 'id_ruta'),
            ],
        ];
    }
}