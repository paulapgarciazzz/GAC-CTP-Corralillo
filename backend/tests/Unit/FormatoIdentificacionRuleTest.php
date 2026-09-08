<?php

namespace Tests\Unit;

use App\Modules\SolicitudesAgrupaciones\Rules\FormatoIdentificacion;
use Tests\TestCase;

class FormatoIdentificacionRuleTest extends TestCase
{
    private function validar(string $tipo, string $valor): array
    {
        $errores = [];
        $rule = new FormatoIdentificacion();
        $rule->setData(['tipo_identificacion' => $tipo]);
        $rule->validate('cedula', $valor, function (string $mensaje) use (&$errores) {
            $errores[] = $mensaje;
        });

        return $errores;
    }

    public function test_cedula_de_9_digitos_es_valida(): void
    {
        $this->assertEmpty($this->validar('cedula', '123456789'));
    }

    public function test_cedula_de_8_digitos_es_invalida(): void
    {
        $this->assertNotEmpty($this->validar('cedula', '12345678'));
    }

    public function test_dimex_de_11_digitos_es_valido(): void
    {
        $this->assertEmpty($this->validar('dimex', '12345678901'));
    }

    public function test_dimex_de_12_digitos_es_valido(): void
    {
        $this->assertEmpty($this->validar('dimex', '123456789012'));
    }

    public function test_dimex_de_10_digitos_es_invalido(): void
    {
        $this->assertNotEmpty($this->validar('dimex', '1234567890'));
    }

    public function test_pasaporte_alfanumerico_valido(): void
    {
        $this->assertEmpty($this->validar('pasaporte', 'A1234567'));
    }

    public function test_pasaporte_de_5_caracteres_es_invalido(): void
    {
        $this->assertNotEmpty($this->validar('pasaporte', 'A1234'));
    }

    public function test_tipo_desconocido_no_reporta_error_de_formato(): void
    {
        $this->assertEmpty($this->validar('otro', '123456789'));
    }
}
