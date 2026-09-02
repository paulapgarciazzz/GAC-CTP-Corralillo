<?php

namespace App\Modules\SolicitudesAgrupaciones\Rules;

use Closure;
use Illuminate\Contracts\Validation\DataAwareRule;
use Illuminate\Contracts\Validation\ValidationRule;

class FormatoIdentificacion implements DataAwareRule, ValidationRule
{
    protected array $data = [];

    protected const FORMATOS = [
        'cedula' => [
            'regex' => '/^\d{9}$/',
            'mensaje' => 'La cédula debe contener exactamente 9 dígitos.',
        ],
        'dimex' => [
            'regex' => '/^\d{11,12}$/',
            'mensaje' => 'El DIMEX debe contener 11 o 12 dígitos.',
        ],
        'pasaporte' => [
            'regex' => '/^[A-Za-z0-9]{6,20}$/',
            'mensaje' => 'El número de pasaporte debe ser alfanumérico, entre 6 y 20 caracteres.',
        ],
    ];

    public function setData(array $data): static
    {
        $this->data = $data;

        return $this;
    }

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $tipo = $this->data['tipo_identificacion'] ?? null;
        $formato = self::FORMATOS[$tipo] ?? null;

        if ($formato === null) {
            return;
        }

        if (!preg_match($formato['regex'], (string) $value)) {
            $fail($formato['mensaje']);
        }
    }
}
