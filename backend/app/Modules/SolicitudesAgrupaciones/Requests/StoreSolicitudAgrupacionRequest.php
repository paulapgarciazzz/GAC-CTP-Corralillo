<?php

namespace App\Modules\SolicitudesAgrupaciones\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSolicitudAgrupacionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id_agrupacion' => [
                'required',
                'integer',
                'exists:agrupacion,id',
            ],

            'fecha_solicitud' => [
                'required',
                'date',
            ],

            'comentarios' => [
                'nullable',
                'string',
            ],
        ];
    }
}