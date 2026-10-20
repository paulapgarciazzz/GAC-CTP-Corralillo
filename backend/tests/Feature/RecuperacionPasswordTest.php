<?php

namespace Tests\Feature;

use App\Mail\CodigoRecuperacionPassword;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class RecuperacionPasswordTest extends TestCase
{
    use RefreshDatabase;

    private User $usuario;

    protected function setUp(): void
    {
        parent::setUp();

        Mail::fake();

        $this->usuario = User::create([
            'name' => 'Ana Pérez',
            'email' => 'ana@example.com',
            'password' => 'password-anterior',
        ]);
    }

    public function test_envia_codigo_a_un_usuario_activo(): void
    {
        $this->postJson('/api/password/codigo', ['email' => 'ana@example.com'])->assertOk();

        Mail::assertSent(CodigoRecuperacionPassword::class, fn ($mail) => $mail->hasTo('ana@example.com'));
        $this->assertDatabaseHas('password_reset_tokens', ['email' => 'ana@example.com']);
    }

    public function test_no_envia_codigo_a_correo_inexistente_ni_a_usuario_inactivo(): void
    {
        $this->usuario->update(['activo' => false]);

        $this->postJson('/api/password/codigo', ['email' => 'ana@example.com'])->assertOk();
        $this->postJson('/api/password/codigo', ['email' => 'nadie@example.com'])->assertOk();

        Mail::assertNothingSent();
        $this->assertDatabaseCount('password_reset_tokens', 0);
    }

    public function test_codigo_correcto_cambia_la_contrasena_y_cierra_sesiones(): void
    {
        $codigo = $this->solicitarCodigo();
        $this->usuario->createToken('spa');

        $this->postJson('/api/password/restablecer', $this->datosRestablecer($codigo))->assertOk();

        $this->assertTrue(Hash::check('password-nueva', $this->usuario->refresh()->password));
        $this->assertDatabaseCount('password_reset_tokens', 0);
        $this->assertSame(0, $this->usuario->tokens()->count());
    }

    public function test_codigo_incorrecto_es_rechazado(): void
    {
        $codigo = $this->solicitarCodigo();
        $otro = str_pad((string) (((int) $codigo + 1) % 1000000), 6, '0', STR_PAD_LEFT);

        $this->postJson('/api/password/restablecer', $this->datosRestablecer($otro))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('codigo');

        $this->assertTrue(Hash::check('password-anterior', $this->usuario->refresh()->password));
    }

    public function test_codigo_vencido_es_rechazado(): void
    {
        $codigo = $this->solicitarCodigo();

        $this->travel(config('auth.passwords.users.expire') + 1)->minutes();

        $this->postJson('/api/password/restablecer', $this->datosRestablecer($codigo))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('codigo');
    }

    public function test_la_confirmacion_debe_coincidir(): void
    {
        $codigo = $this->solicitarCodigo();

        $this->postJson('/api/password/restablecer', [
            ...$this->datosRestablecer($codigo),
            'password_confirmation' => 'otra-cosa',
        ])->assertUnprocessable()->assertJsonValidationErrors('password');
    }

    private function solicitarCodigo(): string
    {
        $this->postJson('/api/password/codigo', ['email' => 'ana@example.com'])->assertOk();

        $codigo = null;
        Mail::assertSent(CodigoRecuperacionPassword::class, function ($mail) use (&$codigo) {
            $codigo = $mail->codigo;

            return true;
        });

        return $codigo;
    }

    private function datosRestablecer(string $codigo): array
    {
        return [
            'email' => 'ana@example.com',
            'codigo' => $codigo,
            'password' => 'password-nueva',
            'password_confirmation' => 'password-nueva',
        ];
    }
}
