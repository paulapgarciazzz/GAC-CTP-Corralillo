<?php

namespace App\Modules\Personalizacion\Patrocinadores\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReordenarPatrocinadoresRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'patrocinadores' => [
                'required',
                'array',
                'min:1',
            ],
            'patrocinadores.*.id_patrocinador' => [
                'required',
                'integer',
                'exists:patrocinador,id_patrocinador',
            ],
            'patrocinadores.*.orden' => [
                'required',
                'integer',
                'min:0',
            ],
        ];
    }
}
