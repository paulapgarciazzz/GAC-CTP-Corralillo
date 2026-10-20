<?php

namespace App\Modules\Usuarios\Services;

use App\Mail\CodigoRecuperacionPassword;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class RecuperacionPasswordService
{
    private const TABLA = 'password_reset_tokens';

    /**
     * Envía un código de 6 dígitos al correo de un usuario activo. Si el correo no
     * corresponde a un usuario activo no hace nada, para no revelar qué correos existen.
     */
    public function enviarCodigo(string $email): void
    {
        $usuario = User::where('email', $email)->where('activo', true)->first();

        if (! $usuario) {
            return;
        }

        $codigo = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        DB::table(self::TABLA)->updateOrInsert(
            ['email' => $usuario->email],
            ['token' => Hash::make($codigo), 'created_at' => now()],
        );

        Mail::to($usuario->email)->send(new CodigoRecuperacionPassword($codigo, $this->minutosVigencia()));
    }

    /**
     * Cambia la contraseña si el código es válido y no ha expirado. El código se
     * consume y se cierran las sesiones abiertas del usuario.
     */
    public function restablecer(string $email, string $codigo, string $password): void
    {
        $registro = DB::table(self::TABLA)->where('email', $email)->first();
        $usuario = User::where('email', $email)->where('activo', true)->first();

        if (! $registro || ! $usuario || $this->expiro($registro->created_at) || ! Hash::check($codigo, $registro->token)) {
            throw ValidationException::withMessages(['codigo' => 'El código no es válido o ha expirado.']);
        }

        DB::transaction(function () use ($usuario, $password) {
            $usuario->update(['password' => $password]);
            $usuario->tokens()->delete();
            DB::table(self::TABLA)->where('email', $usuario->email)->delete();
        });
    }

    private function expiro(?string $creadoEn): bool
    {
        return ! $creadoEn || Carbon::parse($creadoEn)->addMinutes($this->minutosVigencia())->isPast();
    }

    private function minutosVigencia(): int
    {
        return (int) config('auth.passwords.users.expire', 60);
    }
}
