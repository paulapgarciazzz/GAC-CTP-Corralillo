<?php

namespace Tests\Unit;

use App\Modules\SolicitudesAgrupaciones\Rules\FotoValida;
use Tests\TestCase;

class FotoValidaRuleTest extends TestCase
{
    private const PNG_1X1 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

    private function validar(string $value): array
    {
        $errores = [];
        (new FotoValida())->validate('foto_url', $value, function (string $mensaje) use (&$errores) {
            $errores[] = $mensaje;
        });

        return $errores;
    }

    public function test_png_valido_no_reporta_errores(): void
    {
        $this->assertEmpty($this->validar('data:image/png;base64,' . self::PNG_1X1));
    }

    public function test_jpeg_valido_no_reporta_errores(): void
    {
        $contenido = "\xFF\xD8\xFF\xE0" . str_repeat('a', 20);
        $this->assertEmpty($this->validar('data:image/jpeg;base64,' . base64_encode($contenido)));
    }

    public function test_pdf_es_rechazado(): void
    {
        $contenido = "%PDF-1.4\n%%EOF";
        $this->assertNotEmpty($this->validar('data:application/pdf;base64,' . base64_encode($contenido)));
    }

    public function test_mime_declarado_no_coincide_con_contenido_real(): void
    {
        $contenido = "%PDF-1.4\n%%EOF";
        $this->assertNotEmpty($this->validar('data:image/png;base64,' . base64_encode($contenido)));
    }

    public function test_texto_plano_es_rechazado(): void
    {
        $this->assertNotEmpty($this->validar('esto no es un data-uri'));
    }

    public function test_foto_que_excede_el_tamano_maximo_es_rechazada(): void
    {
        $contenidoGrande = "\x89PNG\r\n\x1a\n" . str_repeat('a', 3 * 1024 * 1024);
        $this->assertNotEmpty($this->validar('data:image/png;base64,' . base64_encode($contenidoGrande)));
    }
}
