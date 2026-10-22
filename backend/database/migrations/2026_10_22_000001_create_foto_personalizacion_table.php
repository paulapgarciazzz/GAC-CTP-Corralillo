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
        Schema::create('foto_personalizacion', function (Blueprint $table) {
            $table->id('id_foto');

            // 'hero' (carrusel de la portada) o 'galeria' (galería opcional de la landing).
            $table->string('destino', 20);

            // Ruta relativa dentro del disco "public" de Laravel Storage.
            $table->string('archivo');

            $table->string('titulo', 150)->nullable();

            $table->unsignedInteger('orden')->default(0);

            $table->boolean('activo')->default(true);

            $table->timestamps();

            $table->index(['destino', 'activo', 'orden']);
        });
    }

    /**
     * Revierte la migración.
     */
    public function down(): void
    {
        Schema::dropIfExists('foto_personalizacion');
    }
};
