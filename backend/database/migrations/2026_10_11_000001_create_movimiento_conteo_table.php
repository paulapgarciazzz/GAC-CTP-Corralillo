<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Ejecuta la migración.
     */
    public function up(): void
    {
        Schema::create('movimiento_conteo', function (Blueprint $table) {
            $table->id('id_movimiento');

            $table->unsignedBigInteger('id_sensor');

            // Se copia del sensor en el momento del registro: aunque el tipo
            // del sensor cambie después, el histórico del movimiento no se
            // altera (igual que los movimientos de alimentación no cambian
            // si el catálogo cambia).
            $table->enum('tipo', ['entrada', 'salida']);

            // Identificador que genera el dispositivo para cada evento físico
            // detectado. La restricción única es lo que evita contar dos
            // veces el mismo evento si el ESP32 reintenta el envío.
            $table->string('identificador_evento', 64)->unique();

            $table->dateTime('ocurrido_en');

            $table->timestamps();

            $table->foreign('id_sensor', 'fk_movimiento_conteo_sensor')
                ->references('id_sensor')
                ->on('sensor_conteo')
                ->restrictOnDelete();

            $table->index(['id_sensor', 'ocurrido_en'], 'idx_movimiento_conteo_sensor_fecha');
        });
    }

    /**
     * Revierte la migración.
     */
    public function down(): void
    {
        Schema::dropIfExists('movimiento_conteo');
    }
};
