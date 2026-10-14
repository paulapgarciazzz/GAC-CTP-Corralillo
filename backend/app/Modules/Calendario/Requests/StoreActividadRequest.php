<?php

namespace App\Modules\Calendario\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreActividadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'titulo' => ['required', 'string', 'max:150'],
            'fecha' => ['required', 'date_format:Y-m-d'],
            'hora_inicio' => ['required', 'date_format:H:i'],
            'hora_finalizacion' => [
                'required',
                'date_format:H:i',
                'after:hora_inicio',
            ],
            'id_evento' => ['required', 'integer', 'exists:evento,id_evento'],
            'id_ubicacion' => ['nullable', 'integer', 'exists:ubicacion,id_ubicacion'],
            'id_agrupacion' => ['nullable', 'integer', 'exists:agrupacion,id'],
            // El estado se calcula automáticamente a partir de fecha y horas.
            'id_estado_actividad' => ['prohibited'],
        ];
    }
}
