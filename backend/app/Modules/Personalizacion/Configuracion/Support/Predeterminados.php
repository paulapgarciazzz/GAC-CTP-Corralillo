<?php

namespace App\Modules\Personalizacion\Configuracion\Support;

/**
 * Valores originales del sitio y reglas de validación de cada sección de
 * Personalización. La tabla `personalizacion` solo guarda lo que el usuario
 * cambió; todo lo demás se resuelve con estos predeterminados, así que una
 * base sin filas muestra exactamente el sitio original.
 */
final class Predeterminados
{
    public const SECCIONES = ['landing', 'correos', 'apariencia', 'contacto'];

    /** Plantillas de correo personalizables (las tres que envía Solicitudes). */
    public const TIPOS_CORREO = ['aprobada', 'rechazada', 'detalle'];

    /** Imágenes que se suben por separado (multipart), por sección. */
    public const IMAGENES = [
        'apariencia' => ['escudo', 'logo'],
        'correos' => ['escudo'],
    ];

    /** Variables que se pueden usar en los textos de los correos. */
    public const VARIABLES_CORREO = [
        'encargado' => 'Nombre del encargado',
        'agrupacion' => 'Nombre de la agrupación',
        'estado' => 'Estado de la solicitud',
        'fecha_asignada' => 'Fecha asignada (dd/mm/aaaa)',
        'hora_asignada' => 'Hora asignada',
    ];

    /** Ruta pública (backend/public) del escudo original usado en los correos. */
    public const ESCUDO_CORREO_ORIGINAL = 'img/escudo-ctp.png';

    private const PIE_CORREO = "**Sistema de Gestión de Actividades Complementarias**\nCTP Corralillo";

    private const AVISO_CORREO = 'Este es un correo automático del Sistema de Gestión de Actividades Complementarias. Por favor, no responda a este correo.';

    /**
     * @return array<string, mixed>
     */
    public static function de(string $seccion): array
    {
        return match ($seccion) {
            'landing' => [
                'nombre_institucion' => 'CTP de Corralillo',
                'hero_etiqueta' => 'Colegio Técnico Profesional',
                'hero_titulo' => 'CTP de Corralillo',
                'hero_descripcion' => 'Educación técnica de calidad, formando estudiantes íntegros y comprometidos con Corralillo, Nicoya y Guanacaste desde 1977.',
                'conocenos_titulo' => 'Conócenos',
                'lema' => 'Educación · Progreso · Libertad',
                'conocenos_descripcion' => 'Desde 1977 formando estudiantes técnicos comprometidos con Corralillo, Nicoya y Guanacaste.',
                'vision_titulo' => 'Visión',
                'vision' => 'Ser una institución educativa líder en la región, reconocida por su excelencia académica, formación integral y compromiso con el desarrollo sostenible, formando ciudadanos críticos, creativos y solidarios.',
                'mision_titulo' => 'Misión',
                'mision' => 'Ofrecer una educación de calidad basada en valores, innovación pedagógica y tecnología, que potencie las habilidades de nuestros estudiantes y los prepare para enfrentar los desafíos del mundo actual, con responsabilidad social y respeto por la diversidad.',
                'footer_descripcion' => 'Educación · Progreso · Libertad desde 1977.',
            ],
            'contacto' => [
                'correo' => 'ctp.decorralillo@mep.go.cr',
                'telefono' => '+506 4500 1829',
                'direccion' => '150 mts Norte de la plaza de deportes, Corralillo, Nicoya, Guanacaste',
                'ubicacion_mapa' => '6JFF+WH Corralillo High School, Guanacaste Province, Moracia de Nicoya',
                'facebook' => 'https://www.facebook.com/CTPDeCorralillo/?locale=es_LA',
                'instagram' => 'https://www.instagram.com/ctpdecorralillo/',
                'youtube' => null,
                'tiktok' => null,
                'whatsapp' => null,
            ],
            'apariencia' => [
                // Mismos valores que el tema claro de frontend/src/index.css.
                'color_primario' => '#277a48',
                'color_primario_hover' => '#1e5c37',
                'color_acento' => '#2c8a9c',
                'color_riel' => '#1a1e3c',
                'escudo' => null,
                'logo' => null,
                'mostrar_galeria' => false,
                'galeria_titulo' => 'Galería',
                'galeria_descripcion' => null,
            ],
            'correos' => [
                'escudo' => null,
                'aprobada' => [
                    'asunto' => 'Solicitud de Agrupación Aprobada',
                    'encabezado' => '✓ Solicitud Aprobada',
                    'saludo' => 'Estimado {encargado},',
                    'introduccion' => 'Le informamos que su solicitud de agrupación ha sido **aprobada** exitosamente.',
                    'mensaje_principal' => 'Agradecemos su participación y le deseamos éxito en la actividad.',
                    'despedida' => null,
                    'firma' => null,
                    'aviso' => self::AVISO_CORREO,
                    'pie_pagina' => self::PIE_CORREO,
                ],
                'rechazada' => [
                    'asunto' => 'Solicitud de Agrupación Rechazada',
                    'encabezado' => '✗ Solicitud Rechazada',
                    'saludo' => 'Estimado {encargado},',
                    'introduccion' => 'Le informamos que su solicitud de agrupación ha sido **rechazada**.',
                    'mensaje_principal' => 'Si tiene preguntas sobre esta decisión, le recomendamos ponerse en contacto con la administración.',
                    'despedida' => null,
                    'firma' => null,
                    'aviso' => self::AVISO_CORREO,
                    'pie_pagina' => self::PIE_CORREO,
                ],
                'detalle' => [
                    'asunto' => 'Detalles de su Solicitud de Agrupación',
                    'encabezado' => 'Detalles de la Solicitud',
                    'saludo' => 'Estimado {encargado},',
                    'introduccion' => 'A continuación le compartimos los detalles registrados de su solicitud de agrupación.',
                    'mensaje_principal' => null,
                    'despedida' => null,
                    'firma' => null,
                    'aviso' => self::AVISO_CORREO,
                    'pie_pagina' => self::PIE_CORREO,
                ],
            ],
        };
    }

    /**
     * Reglas de validación de los textos de una sección. Las imágenes van
     * por su propio endpoint y nunca se aceptan aquí.
     *
     * @return array<string, mixed>
     */
    public static function reglas(string $seccion): array
    {
        $texto = fn (int $max, bool $requerido = false) => [$requerido ? 'required' : 'nullable', 'string', 'max:' . $max];
        $url = ['nullable', 'url:http,https', 'max:255'];
        $color = ['required', 'string', 'regex:/^#[0-9a-fA-F]{6}$/'];

        return match ($seccion) {
            'landing' => [
                'nombre_institucion' => $texto(80, true),
                'hero_etiqueta' => $texto(80),
                'hero_titulo' => $texto(120, true),
                'hero_descripcion' => $texto(400),
                'conocenos_titulo' => $texto(80, true),
                'lema' => $texto(120),
                'conocenos_descripcion' => $texto(400),
                'vision_titulo' => $texto(60, true),
                'vision' => $texto(1500, true),
                'mision_titulo' => $texto(60, true),
                'mision' => $texto(1500, true),
                'footer_descripcion' => $texto(200),
            ],
            'contacto' => [
                'correo' => ['nullable', 'email', 'max:150'],
                'telefono' => $texto(40),
                'direccion' => $texto(255),
                'ubicacion_mapa' => $texto(255),
                'facebook' => $url,
                'instagram' => $url,
                'youtube' => $url,
                'tiktok' => $url,
                // Número en formato internacional (p. ej. +506 8888 8888).
                'whatsapp' => ['nullable', 'string', 'regex:/^\+?[0-9 ]{8,20}$/'],
            ],
            'apariencia' => [
                'color_primario' => $color,
                'color_primario_hover' => $color,
                'color_acento' => $color,
                'color_riel' => $color,
                'mostrar_galeria' => ['required', 'boolean'],
                'galeria_titulo' => $texto(80, true),
                'galeria_descripcion' => $texto(400),
            ],
            'correos' => array_merge(...array_map(
                fn (string $tipo) => self::reglasCorreo($tipo . '.'),
                self::TIPOS_CORREO
            )),
        };
    }

    /**
     * Reglas de una plantilla de correo. `$prefijo` permite reutilizarlas
     * para la sección completa ("aprobada.asunto") o la vista previa ("textos.asunto").
     *
     * @return array<string, mixed>
     */
    public static function reglasCorreo(string $prefijo = ''): array
    {
        return [
            $prefijo . 'asunto' => ['required', 'string', 'max:150'],
            $prefijo . 'encabezado' => ['required', 'string', 'max:120'],
            $prefijo . 'saludo' => ['nullable', 'string', 'max:150'],
            $prefijo . 'introduccion' => ['nullable', 'string', 'max:1000'],
            $prefijo . 'mensaje_principal' => ['nullable', 'string', 'max:3000'],
            $prefijo . 'despedida' => ['nullable', 'string', 'max:500'],
            $prefijo . 'firma' => ['nullable', 'string', 'max:500'],
            $prefijo . 'aviso' => ['nullable', 'string', 'max:500'],
            $prefijo . 'pie_pagina' => ['nullable', 'string', 'max:500'],
        ];
    }
}
