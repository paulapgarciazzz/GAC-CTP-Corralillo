<?php

namespace App\Modules\Calendario\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DuplicarActividadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id_evento' => ['required', 'integer', 'exists:evento,id_evento'],
            'fecha' => ['required', 'date_format:Y-m-d'],
            'hora_inicio' => ['sometimes', 'required', 'date_format:H:i'],
            'hora_finalizacion' => ['sometimes', 'required', 'date_format:H:i'],
            'id_ubicacion' => ['sometimes', 'nullable', 'integer', 'exists:ubicacion,id_ubicacion'],
        ];
    }
}
