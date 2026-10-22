<?php

namespace App\Mail;

use App\Modules\Personalizacion\Configuracion\Services\PlantillaCorreoService;
use App\Modules\SolicitudesAgrupaciones\Models\SolicitudAgrupacion;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SolicitudDetalleNotification extends Mailable
{
    use Queueable, SerializesModels;

    /** Textos resueltos de la plantilla (Personalización › Correos). */
    private ?array $plantilla = null;

    /**
     * Create a new message instance.
     *
     * @param  array<string, mixed>|null  $textosSinGuardar  Solo para la vista previa del panel.
     */
    public function __construct(
        public SolicitudAgrupacion $solicitud,
        public ?array $textosSinGuardar = null
    ) {
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->plantilla()['asunto'],
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.solicitud-detalle',
            with: [
                'solicitud' => $this->solicitud,
                'agrupacion' => $this->solicitud->agrupacion,
                'encargado' => $this->solicitud->agrupacion->encargado,
                'correo' => $this->plantilla(),
            ],
        );
    }

    /**
     * @return array{asunto: string, escudo_url: string, textos: array<string, mixed>}
     */
    private function plantilla(): array
    {
        return $this->plantilla ??= app(PlantillaCorreoService::class)
            ->para('detalle', $this->solicitud, $this->textosSinGuardar);
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
