<?php

namespace App\Modules\Personalizacion\Configuracion\Controllers;

use App\Http\Controllers\Controller;
use App\Mail\SolicitudAprobadaNotification;
use App\Mail\SolicitudDetalleNotification;
use App\Mail\SolicitudRechazadaNotification;
use App\Modules\Personalizacion\Configuracion\Requests\VistaPreviaCorreoRequest;
use App\Modules\SolicitudesAgrupaciones\Models\Agrupacion;
use App\Modules\SolicitudesAgrupaciones\Models\Encargado;
use App\Modules\SolicitudesAgrupaciones\Models\Estado;
use App\Modules\SolicitudesAgrupaciones\Models\SolicitudAgrupacion;
use Illuminate\Http\JsonResponse;

/**
 * Renderiza un correo con datos de ejemplo y los textos del formulario.
 * No envía ni guarda nada: los modelos de ejemplo solo existen en memoria.
 */
class VistaPreviaCorreoController extends Controller
{
    private const MAILABLES = [
        'aprobada' => SolicitudAprobadaNotification::class,
        'rechazada' => SolicitudRechazadaNotification::class,
        'detalle' => SolicitudDetalleNotification::class,
    ];

    public function __invoke(VistaPreviaCorreoRequest $request): JsonResponse
    {
        $tipo = $request->validated('tipo');
        $clase = self::MAILABLES[$tipo];
        $mailable = new $clase($this->solicitudDeEjemplo($tipo), $request->validated('textos'));

        return response()->json([
            'data' => [
                'asunto' => $mailable->envelope()->subject,
                'html' => $mailable->render(),
            ],
        ]);
    }

    private function solicitudDeEjemplo(string $tipo): SolicitudAgrupacion
    {
        $encargado = (new Encargado)->forceFill([
            'cedula' => '504440555',
            'tipo_identificacion' => 'cedula',
            'primer_nombre' => 'María',
            'apellido' => 'Rodríguez Solano',
            'email' => 'encargado@ejemplo.com',
            'numero_tel' => '8888-8888',
        ]);

        $agrupacion = (new Agrupacion)->forceFill([
            'nombre' => 'Grupo de Baile Folclórico Nicoyano',
            'lugar_procedencia' => 'Nicoya, Guanacaste',
            'cantidad_integrantes' => 18,
            'resena' => 'Agrupación de ejemplo para la vista previa.',
        ])->setRelation('encargado', $encargado);

        $estado = (new Estado)->forceFill([
            'nom_estado' => match ($tipo) {
                'aprobada' => 'aprobada',
                'rechazada' => 'rechazada',
                default => 'pendiente',
            },
        ]);

        $conFecha = $tipo !== 'rechazada';

        return (new SolicitudAgrupacion)->forceFill([
            'fecha_solicitud' => now(),
            'fecha_asignada' => $conFecha ? now()->addWeeks(2) : null,
            'hora_asignada' => $conFecha ? '10:00' : null,
            'comentarios' => $tipo === 'detalle' ? 'Comentario de ejemplo.' : null,
        ])
            ->setRelation('agrupacion', $agrupacion)
            ->setRelation('estado', $estado);
    }
}
