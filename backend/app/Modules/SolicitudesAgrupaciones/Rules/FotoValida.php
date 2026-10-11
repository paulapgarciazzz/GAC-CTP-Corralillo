<?php

namespace App\Modules\SolicitudesAgrupaciones\Rules;

use App\Modules\SolicitudesAgrupaciones\Support\DataUri;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class FotoValida implements ValidationRule
{
    private const TAMANO_MAXIMO_BYTES = 2 * 1024 * 1024; // 2MB decodificados

    private const FIRMAS = [
        'image/png' => "\x89PNG\r\n\x1a\n",
        'image/jpeg' => "\xFF\xD8\xFF",
    ];

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (!is_string($value)) {
            $fail('La foto no tiene un formato válido.');

            return;
        }

        $datos = DataUri::parse($value);

        if ($datos === null) {
            $fail('La foto debe ser una imagen válida codificada correctamente.');

            return;
        }

        if (!array_key_exists($datos['mime'], self::FIRMAS)) {
            $fail('La foto debe ser una imagen PNG o JPG.');

            return;
        }

        if (strlen($datos['binario']) > self::TAMANO_MAXIMO_BYTES) {
            $fail('La foto no debe superar los 2MB.');

            return;
        }

        if (!str_starts_with($datos['binario'], self::FIRMAS[$datos['mime']])) {
            $fail('El contenido de la foto no coincide con el tipo declarado.');
        }
    }
}
