<?php

namespace App\Modules\SolicitudesAgrupaciones\Requests;

use App\Modules\SolicitudesAgrupaciones\Rules\ArchivoAdjuntoValido;
use Illuminate\Foundation\Http\FormRequest;

class UpdateAgrupacionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre' => [
                'sometimes',
                'required',
                'string',
                'max:150',
            ],

            'lugar_procedencia' => [
                'sometimes',
                'required',
                'string',
                'max:150',
            ],

            'cantidad_integrantes' => [
                'sometimes',
                'required',
                'integer',
                'min:1',
            ],

            'resena' => [
                'sometimes',
                'nullable',
                'string',
                'max:5000',
            ],

            'archivo_adjunto' => [
                'sometimes',
                'nullable',
                'string',
                new ArchivoAdjuntoValido(),
            ],

            'foto_url' => [
                'sometimes',
                'nullable',
                'string',
            ],
        ];
    }
}