<?php

namespace Tests\Feature;

use App\Mail\SolicitudAprobadaNotification;
use App\Mail\SolicitudDetalleNotification;
use App\Mail\SolicitudRechazadaNotification;
use App\Modules\SolicitudesAgrupaciones\Models\Agrupacion;
use App\Modules\SolicitudesAgrupaciones\Models\Encargado;
use App\Modules\SolicitudesAgrupaciones\Models\Estado;
use App\Modules\SolicitudesAgrupaciones\Models\SolicitudAgrupacion;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class SolicitudAgrupacionEmailNotificationTest extends TestCase
{
    use RefreshDatabase;

    private Encargado $encargado;
    private Agrupacion $agrupacion;
    private Estado $estadoPendiente;
    private Estado $estadoAprobado;
    private Estado $estadoRechazado;

    protected function setUp(): void
{
    parent::setUp();

    // Create states
    $this->estadoPendiente = Estado::forceCreate([
        'nom_estado' => 'pendiente',
    ]);

    $this->estadoAprobado = Estado::forceCreate([
        'nom_estado' => 'aprobada',
    ]);

    $this->estadoRechazado = Estado::forceCreate([
        'nom_estado' => 'rechazada',
    ]);

    // Create encargado
    $this->encargado = Encargado::create([
        'cedula' => '1234567890',
        'primer_nombre' => 'Juan',
        'apellido' => 'García',
        'email' => 'juan.garcia@example.com',
        'numero_tel' => '1234567890',
    ]);


        // Create agrupacion
        $this->agrupacion = Agrupacion::create([
            'ced_encargado' => $this->encargado->cedula,
            'nombre' => 'Agrupación de Danza Folclórica',
            'lugar_procedencia' => 'Región Central',
            'cantidad_integrantes' => 15,
            'resena' => 'Grupo dedicado a la preservación de danzas folclóricas',
        ]);
    }

    /**
     * Test that approving a solicitud sends an approval notification email.
     * 
     * Requirement: Al aprobar una solicitud se prepara/envía el correo correspondiente.
     */
    public function test_approving_solicitud_sends_approval_email(): void
    {
        Mail::fake();

        $solicitud = SolicitudAgrupacion::create([
            'id_agrupacion' => $this->agrupacion->id,
            'fecha_solicitud' => now(),
            'id_estado' => $this->estadoPendiente->id,
            'comentarios' => 'Test solicitud',
            'fecha_asignada' => '2026-09-15',
            'hora_asignada' => '10:00',
        ]);

        $solicitud->load('agrupacion.encargado', 'estado');

        $service = app(\App\Modules\SolicitudesAgrupaciones\Services\SolicitudAgrupacionService::class);
        $service->aprobar($solicitud->id, [
            'fecha_asignada' => '2026-09-15',
            'hora_asignada' => '10:00',
        ]);

        Mail::assertSent(SolicitudAprobadaNotification::class);
    }

    /**
     * Test that rejecting a solicitud sends a rejection notification email.
     * 
     * Requirement: Al rechazar una solicitud se prepara/envía el correo correspondiente.
     */
    public function test_rejecting_solicitud_sends_rejection_email(): void
    {
        Mail::fake();

        $solicitud = SolicitudAgrupacion::create([
            'id_agrupacion' => $this->agrupacion->id,
            'fecha_solicitud' => now(),
            'id_estado' => $this->estadoPendiente->id,
            'comentarios' => 'Test solicitud',
        ]);

        $solicitud->load('agrupacion.encargado', 'estado');

        $service = app(\App\Modules\SolicitudesAgrupaciones\Services\SolicitudAgrupacionService::class);
        $service->rechazar($solicitud->id);

        Mail::assertSent(SolicitudRechazadaNotification::class);
    }

    /**
     * Test that the email recipient is the encargado's email from the database.
     * 
     * Requirement: El destinatario corresponde al email del encargado relacionado.
     */
    public function test_email_recipient_is_encargado_email(): void
    {
        Mail::fake();

        $solicitud = SolicitudAgrupacion::create([
            'id_agrupacion' => $this->agrupacion->id,
            'fecha_solicitud' => now(),
            'id_estado' => $this->estadoPendiente->id,
            'comentarios' => 'Test solicitud',
        ]);

        $service = app(\App\Modules\SolicitudesAgrupaciones\Services\SolicitudAgrupacionService::class);
        $service->aprobar($solicitud->id, []);

        Mail::assertSent(SolicitudAprobadaNotification::class, function ($mail) {
            return $mail->hasTo($this->encargado->email);
        });
    }

    /**
     * Test that email is obtained from database, not from client request.
     * 
     * Requirement: No se obtiene el email desde datos enviados por el cliente.
     */
    public function test_email_not_obtained_from_client_request(): void
    {
        Mail::fake();

        // Attempt to approve with wrong email in request - should use database email
        $solicitud = SolicitudAgrupacion::create([
            'id_agrupacion' => $this->agrupacion->id,
            'fecha_solicitud' => now(),
            'id_estado' => $this->estadoPendiente->id,
        ]);

        $service = app(\App\Modules\SolicitudesAgrupaciones\Services\SolicitudAgrupacionService::class);
        // Even if we could pass email via request (we don't), it should use database email
        $service->aprobar($solicitud->id, []);

        Mail::assertSent(SolicitudAprobadaNotification::class, function ($mail) {
            return $mail->hasTo('juan.garcia@example.com');
        });

        // Should NOT send to any other email
        Mail::assertNotSent(SolicitudAprobadaNotification::class, function ($mail) {
            return $mail->hasTo('attacker@example.com');
        });
    }

    /**
     * Test that approval email contains agrupacion name.
     * 
     * Requirement: El correo de aprobación contiene el nombre de la agrupación.
     */
    public function test_approval_email_contains_agrupacion_name(): void
    {
        Mail::fake();

        $solicitud = SolicitudAgrupacion::create([
            'id_agrupacion' => $this->agrupacion->id,
            'fecha_solicitud' => now(),
            'id_estado' => $this->estadoPendiente->id,
        ]);

        $service = app(\App\Modules\SolicitudesAgrupaciones\Services\SolicitudAgrupacionService::class);
        $service->aprobar($solicitud->id, []);

        Mail::assertSent(SolicitudAprobadaNotification::class, function ($mail) {
            $mailContent = $mail->render();
            return str_contains($mailContent, $this->agrupacion->nombre);
        });
    }

    /**
     * Test that rejection email contains agrupacion name.
     * 
     * Requirement: El correo de rechazo contiene el nombre de la agrupación.
     */
    public function test_rejection_email_contains_agrupacion_name(): void
    {
        Mail::fake();

        $solicitud = SolicitudAgrupacion::create([
            'id_agrupacion' => $this->agrupacion->id,
            'fecha_solicitud' => now(),
            'id_estado' => $this->estadoPendiente->id,
        ]);

        $service = app(\App\Modules\SolicitudesAgrupaciones\Services\SolicitudAgrupacionService::class);
        $service->rechazar($solicitud->id);

        Mail::assertSent(SolicitudRechazadaNotification::class, function ($mail) {
            $mailContent = $mail->render();
            return str_contains($mailContent, $this->agrupacion->nombre);
        });
    }

    /**
     * Test that approval works with null fecha_asignada.
     * 
     * Requirement: Una aprobación funciona con fecha_asignada null.
     */
    public function test_approval_works_with_null_fecha_asignada(): void
    {
        Mail::fake();

        $solicitud = SolicitudAgrupacion::create([
            'id_agrupacion' => $this->agrupacion->id,
            'fecha_solicitud' => now(),
            'id_estado' => $this->estadoPendiente->id,
            'fecha_asignada' => null,
            'hora_asignada' => '10:00',
        ]);

        $service = app(\App\Modules\SolicitudesAgrupaciones\Services\SolicitudAgrupacionService::class);
        $result = $service->aprobar($solicitud->id, [
            'fecha_asignada' => null,
            'hora_asignada' => '10:00',
        ]);

        $this->assertNull($result->fecha_asignada);
        $this->assertStringStartsWith('10:00', $result->hora_asignada);
        Mail::assertSent(SolicitudAprobadaNotification::class);
    }

    /**
     * Test that approval works with null hora_asignada.
     * 
     * Requirement: Una aprobación funciona con hora_asignada null.
     */
    public function test_approval_works_with_null_hora_asignada(): void
    {
        Mail::fake();

        $solicitud = SolicitudAgrupacion::create([
            'id_agrupacion' => $this->agrupacion->id,
            'fecha_solicitud' => now(),
            'id_estado' => $this->estadoPendiente->id,
            'fecha_asignada' => '2026-09-15',
            'hora_asignada' => null,
        ]);

        $service = app(\App\Modules\SolicitudesAgrupaciones\Services\SolicitudAgrupacionService::class);
        $result = $service->aprobar($solicitud->id, [
            'fecha_asignada' => '2026-09-15',
            'hora_asignada' => null,
        ]);

        $this->assertNotNull($result->fecha_asignada);
        $this->assertNull($result->hora_asignada);
        Mail::assertSent(SolicitudAprobadaNotification::class);
    }

    /**
     * Test that approval works with both fecha_asignada and hora_asignada null.
     * 
     * Requirement: Una aprobación funciona con ambas null.
     */
    public function test_approval_works_with_both_dates_null(): void
    {
        Mail::fake();

        $solicitud = SolicitudAgrupacion::create([
            'id_agrupacion' => $this->agrupacion->id,
            'fecha_solicitud' => now(),
            'id_estado' => $this->estadoPendiente->id,
            'fecha_asignada' => null,
            'hora_asignada' => null,
        ]);

        $service = app(\App\Modules\SolicitudesAgrupaciones\Services\SolicitudAgrupacionService::class);
        $result = $service->aprobar($solicitud->id, []);

        $this->assertNull($result->fecha_asignada);
        $this->assertNull($result->hora_asignada);
        Mail::assertSent(SolicitudAprobadaNotification::class);
    }

    /**
     * Test that rejection works without assigned date or time.
     * 
     * Requirement: El rechazo funciona sin fecha ni hora asignadas.
     */
    public function test_rejection_works_without_date_and_time(): void
    {
        Mail::fake();

        $solicitud = SolicitudAgrupacion::create([
            'id_agrupacion' => $this->agrupacion->id,
            'fecha_solicitud' => now(),
            'id_estado' => $this->estadoPendiente->id,
            'fecha_asignada' => null,
            'hora_asignada' => null,
        ]);

        $service = app(\App\Modules\SolicitudesAgrupaciones\Services\SolicitudAgrupacionService::class);
        $result = $service->rechazar($solicitud->id);

        $this->assertNull($result->fecha_asignada);
        $this->assertNull($result->hora_asignada);
        Mail::assertSent(SolicitudRechazadaNotification::class);
    }

    /**
     * Test that approval email contains the assigned date when present.
     */
    public function test_approval_email_displays_fecha_asignada_when_present(): void
    {
        Mail::fake();

        $fechaAsignada = '2026-09-20';
        $solicitud = SolicitudAgrupacion::create([
            'id_agrupacion' => $this->agrupacion->id,
            'fecha_solicitud' => now(),
            'id_estado' => $this->estadoPendiente->id,
            'fecha_asignada' => $fechaAsignada,
        ]);

        $service = app(\App\Modules\SolicitudesAgrupaciones\Services\SolicitudAgrupacionService::class);
        $service->aprobar($solicitud->id, [
            'fecha_asignada' => $fechaAsignada,
        ]);

        Mail::assertSent(SolicitudAprobadaNotification::class, function ($mail) use ($fechaAsignada) {
            $mailContent = $mail->render();
            return str_contains($mailContent, '20/09/2026');
        });
    }

    /**
     * Test that approval email contains the assigned time when present.
     */
    public function test_approval_email_displays_hora_asignada_when_present(): void
    {
        Mail::fake();

        $horaAsignada = '14:30';
        $solicitud = SolicitudAgrupacion::create([
            'id_agrupacion' => $this->agrupacion->id,
            'fecha_solicitud' => now(),
            'id_estado' => $this->estadoPendiente->id,
            'hora_asignada' => $horaAsignada,
        ]);

        $service = app(\App\Modules\SolicitudesAgrupaciones\Services\SolicitudAgrupacionService::class);
        $service->aprobar($solicitud->id, [
            'hora_asignada' => $horaAsignada,
        ]);

        Mail::assertSent(SolicitudAprobadaNotification::class, function ($mail) use ($horaAsignada) {
            $mailContent = $mail->render();
            return str_contains($mailContent, $horaAsignada);
        });
    }

    /**
     * Test that email sending error doesn't break the transaction.
     * The solicitud state should be persisted even if email fails.
     */
    public function test_email_failure_does_not_prevent_status_update(): void
    {
        Mail::fake();
        // Simulate an email sending failure by not faking mail
        Mail::shouldReceive('to')->andThrow(new \Exception('Email service error'));

        $solicitud = SolicitudAgrupacion::create([
            'id_agrupacion' => $this->agrupacion->id,
            'fecha_solicitud' => now(),
            'id_estado' => $this->estadoPendiente->id,
        ]);

        $service = app(\App\Modules\SolicitudesAgrupaciones\Services\SolicitudAgrupacionService::class);
        
        // This should not throw an exception - the status should be updated despite email error
        $result = $service->aprobar($solicitud->id, []);

        $this->assertEquals($this->estadoAprobado->id, $result->id_estado);
        $this->assertEquals('aprobada', $result->estado->nom_estado);
    }

    /**
     * Test that the "enviar detalles" email shows a link to the attached file when present.
     */
    public function test_correo_muestra_enlace_de_archivo_adjunto_cuando_existe(): void
    {
        Mail::fake();

        $this->agrupacion->update([
            'archivo_adjunto' => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
        ]);

        $solicitud = SolicitudAgrupacion::create([
            'id_agrupacion' => $this->agrupacion->id,
            'fecha_solicitud' => now(),
            'id_estado' => $this->estadoPendiente->id,
        ]);
        $solicitud->load('agrupacion.encargado', 'estado');

        $service = app(\App\Modules\SolicitudesAgrupaciones\Services\SolicitudAgrupacionService::class);
        $service->enviarDetalles($solicitud->id);

        Mail::assertSent(SolicitudDetalleNotification::class, function ($mail) {
            $mailContent = $mail->render();
            return str_contains($mailContent, '/archivo-adjunto');
        });
    }

    /**
     * Test that the "enviar detalles" email falls back to the legacy text reseña when there is no attachment.
     */
    public function test_correo_muestra_resena_de_texto_cuando_no_hay_archivo_adjunto(): void
    {
        Mail::fake();

        $this->agrupacion->update(['resena' => 'Una reseña histórica en texto plano.']);

        $solicitud = SolicitudAgrupacion::create([
            'id_agrupacion' => $this->agrupacion->id,
            'fecha_solicitud' => now(),
            'id_estado' => $this->estadoPendiente->id,
        ]);
        $solicitud->load('agrupacion.encargado', 'estado');

        $service = app(\App\Modules\SolicitudesAgrupaciones\Services\SolicitudAgrupacionService::class);
        $service->enviarDetalles($solicitud->id);

        Mail::assertSent(SolicitudDetalleNotification::class, function ($mail) {
            $mailContent = $mail->render();
            return str_contains($mailContent, 'Una reseña histórica en texto plano.')
                && !str_contains($mailContent, '/archivo-adjunto');
        });
    }
}
