<?php

namespace App\Modules\Calendario\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEventoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre' => ['sometimes', 'required', 'string', 'max:100'],
            'fecha_inicio' => [
                'sometimes',
                'required',
                'date_format:Y-m-d',
            ],
            'fecha_fin' => [
                'sometimes',
                'required',
                'date_format:Y-m-d',
                'after_or_equal:fecha_inicio',
            ],
            'hora_inicio' => ['sometimes', 'nullable', 'date_format:H:i'],
            'hora_fin' => ['sometimes', 'nullable', 'date_format:H:i'],
            'todo_el_dia' => ['sometimes', 'boolean'],
            'categoria' => [
                'sometimes',
                Rule::in(StoreEventoRequest::CATEGORIAS),
            ],
            'estado' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * Compara con los datos completos (actuales + enviados): en un PATCH parcial
     * el valor que falta se toma del evento guardado.
     */
    public function after(): array
    {
        return [function ($validator) {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            $evento = $this->route('evento');

            $fechaInicio = $this->input('fecha_inicio', $evento->fecha_inicio->format('Y-m-d'));
            $fechaFin = $this->input('fecha_fin', $evento->fecha_fin->format('Y-m-d'));
            $todoElDia = $this->boolean('todo_el_dia', $evento->todo_el_dia);
            $inicio = $this->exists('hora_inicio') ? $this->input('hora_inicio') : $evento->hora_inicio;
            $fin = $this->exists('hora_fin') ? $this->input('hora_fin') : $evento->hora_fin;

            if ($fechaFin < $fechaInicio) {
                $validator->errors()->add(
                    'fecha_fin',
                    'La fecha de fin debe ser igual o posterior a la fecha de inicio.'
                );

                return;
            }

            if (
                ! $todoElDia
                && $inicio && $fin
                && $fechaInicio === $fechaFin
                && substr($fin, 0, 5) <= substr($inicio, 0, 5)
            ) {
                $validator->errors()->add(
                    'hora_fin',
                    'La hora de fin debe ser posterior a la hora de inicio.'
                );
            }
        }];
    }
}
