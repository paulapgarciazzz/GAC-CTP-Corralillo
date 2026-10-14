<?php

namespace App\Modules\Calendario\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateActividadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'titulo' => ['sometimes', 'required', 'string', 'max:150'],
            'fecha' => ['sometimes', 'required', 'date_format:Y-m-d'],
            'hora_inicio' => ['sometimes', 'required', 'date_format:H:i'],
            'hora_finalizacion' => ['sometimes', 'required', 'date_format:H:i'],
            'id_ubicacion' => ['sometimes', 'nullable', 'integer', 'exists:ubicacion,id_ubicacion'],
            'id_agrupacion' => ['sometimes', 'nullable', 'integer', 'exists:agrupacion,id'],
            // Para pasar una actividad a otro evento se usa el endpoint de duplicar.
            'id_evento' => ['prohibited'],
            'id_estado_actividad' => ['prohibited'],
        ];
    }
}
