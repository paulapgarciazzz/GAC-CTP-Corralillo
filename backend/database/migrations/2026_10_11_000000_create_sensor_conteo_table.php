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
        Schema::create('sensor_conteo', function (Blueprint $table) {
            $table->id('id_sensor');

            $table->string('nombre', 100);

            $table->enum('tipo', ['entrada', 'salida']);

            $table->string('codigo', 50)->unique();

            $table->boolean('activo')->default(true);

            $table->timestamps();
        });
    }

    /**
     * Revierte la migración.
     */
    public function down(): void
    {
        Schema::dropIfExists('sensor_conteo');
    }
};
