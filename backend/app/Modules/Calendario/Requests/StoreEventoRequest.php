<?php

namespace App\Modules\Calendario\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEventoRequest extends FormRequest
{
    public const CATEGORIAS = [
        'success',
        'warning',
        'danger',
        'info',
        'chart-1',
        'chart-2',
        'chart-3',
    ];

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre' => ['required', 'string', 'max:100'],
            'fecha_inicio' => ['required', 'date_format:Y-m-d'],
            'fecha_fin' => [
                'required',
                'date_format:Y-m-d',
                'after_or_equal:fecha_inicio',
            ],
            'hora_inicio' => ['nullable', 'date_format:H:i'],
            'hora_fin' => ['nullable', 'date_format:H:i'],
            'todo_el_dia' => ['sometimes', 'boolean'],
            'categoria' => ['sometimes', Rule::in(self::CATEGORIAS)],
            'estado' => ['sometimes', 'boolean'],
        ];
    }

    public function after(): array
    {
        return [function ($validator) {
            $inicio = $this->input('hora_inicio');
            $fin = $this->input('hora_fin');

            if (
                $inicio && $fin
                && $this->input('fecha_inicio') === $this->input('fecha_fin')
                && $fin <= $inicio
            ) {
                $validator->errors()->add(
                    'hora_fin',
                    'La hora de fin debe ser posterior a la hora de inicio.'
                );
            }
        }];
    }
}
