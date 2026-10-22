<?php

namespace App\Modules\Personalizacion\Configuracion\Services;

use App\Modules\SolicitudesAgrupaciones\Models\SolicitudAgrupacion;
use Illuminate\Support\HtmlString;

/**
 * Prepara los textos personalizables de los correos de solicitudes.
 *
 * Los datos dinámicos (encargado, agrupación, fechas…) siguen saliendo de
 * las plantillas Blade; aquí solo se resuelven los textos libres. Cada texto
 * se escapa y luego admite **negrita**, saltos de línea y las variables de
 * Predeterminados::VARIABLES_CORREO, p. ej. {encargado}.
 */
class PlantillaCorreoService
{
    public function __construct(
        private readonly PersonalizacionService $personalizacion
    ) {
    }

    /**
     * @param  array<string, mixed>|null  $textosSinGuardar  Para la vista previa: textos del formulario aún no guardados.
     * @return array{asunto: string, escudo_url: string, textos: array<string, HtmlString|null>}
     */
    public function para(string $tipo, SolicitudAgrupacion $solicitud, ?array $textosSinGuardar = null): array
    {
        $textos = $textosSinGuardar ?? $this->personalizacion->valores('correos')[$tipo];
        $variables = $this->variables($solicitud);

        return [
            'asunto' => strtr((string) $textos['asunto'], $variables),
            'escudo_url' => $this->personalizacion->escudoCorreo()['url'],
            'textos' => collect($textos)
                ->except('asunto')
                ->map(fn ($texto) => $this->formatear($texto, $variables))
                ->all(),
        ];
    }

    /**
     * @return array<string, string>
     */
    private function variables(SolicitudAgrupacion $solicitud): array
    {
        $agrupacion = $solicitud->agrupacion;

        return [
            '{encargado}' => (string) $agrupacion?->encargado?->primer_nombre,
            '{agrupacion}' => (string) $agrupacion?->nombre,
            '{estado}' => ucfirst((string) $solicitud->estado?->nom_estado),
            '{fecha_asignada}' => (string) $solicitud->fecha_asignada?->format('d/m/Y'),
            '{hora_asignada}' => (string) $solicitud->hora_asignada,
        ];
    }

    /**
     * Texto plano → HTML seguro. Devuelve null si está vacío para que la
     * plantilla omita el bloque.
     *
     * @param  array<string, string>  $variables
     */
    private function formatear(?string $texto, array $variables): ?HtmlString
    {
        if (blank($texto)) {
            return null;
        }

        $variablesEscapadas = array_map(fn (string $valor) => e($valor), $variables);
        $html = strtr(e($texto), $variablesEscapadas);
        $html = preg_replace('/\*\*(.+?)\*\*/s', '<strong>$1</strong>', $html);

        return new HtmlString(nl2br($html, false));
    }
}
