<?php

namespace App\Modules\SolicitudesAgrupaciones\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GestionarSolicitudRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'fecha_asignada' => [
                'nullable',
                'date',
            ],

            'hora_asignada' => [
                'nullable',
                'date_format:H:i',
            ],
        ];
    }
}