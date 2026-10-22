<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Ejecuta la migración.
     *
     * Solo agrega columnas e índices: no modifica ni borra los sensores ni los
     * movimientos que ya existan.
     */
    public function up(): void
    {
        Schema::table('sensor_conteo', function (Blueprint $table) {
            // SHA-256 del token del dispositivo. El token en claro solo se
            // muestra una vez al generarlo (php artisan conteo:token-sensor).
            $table->char('token_hash', 64)->nullable()->after('codigo');

            // Última petición autenticada del dispositivo (movimiento o latido).
            $table->dateTime('ultima_senal_en')->nullable()->after('activo');
        });

        Schema::table('movimiento_conteo', function (Blueprint $table) {
            // Ocupación, historial y reportes filtran por rango de fecha y tipo.
            $table->index(['ocurrido_en', 'tipo'], 'idx_movimiento_conteo_fecha_tipo');
        });
    }

    /**
     * Revierte la migración.
     */
    public function down(): void
    {
        Schema::table('movimiento_conteo', function (Blueprint $table) {
            $table->dropIndex('idx_movimiento_conteo_fecha_tipo');
        });

        Schema::table('sensor_conteo', function (Blueprint $table) {
            $table->dropColumn(['token_hash', 'ultima_senal_en']);
        });
    }
};
