<?php

namespace App\Modules\Personalizacion\Configuracion\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReordenarFotosRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'fotos' => ['required', 'array', 'min:1'],
            'fotos.*.id_foto' => ['required', 'integer', 'exists:foto_personalizacion,id_foto'],
            'fotos.*.orden' => ['required', 'integer', 'min:0'],
        ];
    }
}
