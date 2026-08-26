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
                'required',
                'date',
            ],

            'hora_asignada' => [
                'required',
                'date_format:H:i',
            ],
        ];
    }
}