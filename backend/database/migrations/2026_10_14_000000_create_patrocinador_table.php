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
        Schema::create('patrocinador', function (Blueprint $table) {
            $table->id('id_patrocinador');

            $table->string('nombre', 150);

            // Ruta relativa dentro del disco "public" de Laravel Storage
            // (no base64, a diferencia de agrupacion.foto_url / ubicacion.imagen).
            $table->string('logotipo');

            $table->text('descripcion')->nullable();

            $table->string('enlace')->nullable();

            $table->string('categoria', 20)->nullable();

            $table->unsignedInteger('orden')->default(0);

            $table->boolean('activo')->default(true);

            $table->timestamps();
        });
    }

    /**
     * Revierte la migración.
     */
    public function down(): void
    {
        Schema::dropIfExists('patrocinador');
    }
};
