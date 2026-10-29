<?php

namespace App\Modules\Conteo\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class SensorConteo extends Model
{
    /**
     * Minutos sin señal tras los cuales el panel muestra el sensor como
     * desconectado. El firmware envía un latido cada minuto.
     */
    public const MINUTOS_EN_LINEA = 3;

    protected $table = 'sensor_conteo';

    protected $primaryKey = 'id_sensor';

    protected $fillable = [
        'nombre',
        'tipo',
        'codigo',
        'activo',
    ];

    protected $hidden = [
        'token_hash',
    ];

    protected $casts = [
        'activo' => 'boolean',
        'ultima_senal_en' => 'datetime',
    ];

    public function movimientos(): HasMany
    {
        return $this->hasMany(
            MovimientoConteo::class,
            'id_sensor',
            'id_sensor'
        );
    }

    /**
     * Genera un token nuevo, guarda solo su hash y devuelve el token en claro
     * para configurarlo en el dispositivo. Invalida el token anterior.
     */
    public function generarToken(): string
    {
        $token = Str::random(48);

        $this->establecerToken($token);

        return $token;
    }

    /**
     * Guarda solo el hash de un token generado fuera de la aplicación (p. ej.
     * una variable de entorno privada del servidor). Invalida el anterior.
     */
    public function establecerToken(string $token): void
    {
        $this->forceFill(['token_hash' => hash('sha256', $token)])->save();
    }

    public function aceptaToken(?string $token): bool
    {
        return $this->token_hash !== null
            && filled($token)
            && hash_equals($this->token_hash, hash('sha256', $token));
    }

    public function enLinea(): bool
    {
        return $this->ultima_senal_en !== null
            && $this->ultima_senal_en->greaterThanOrEqualTo(now()->subMinutes(self::MINUTOS_EN_LINEA));
    }
}
