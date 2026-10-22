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
        Schema::create('personalizacion', function (Blueprint $table) {
            $table->id();

            // landing, correos, apariencia o contacto (una fila por sección).
            $table->string('seccion', 30)->unique();

            // Solo los valores que el usuario cambió. Los predeterminados viven
            // en el código (Personalizacion\Configuracion\Support\Predeterminados),
            // así que la tabla vacía equivale al sitio original.
            $table->json('valores')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Revierte la migración.
     */
    public function down(): void
    {
        Schema::dropIfExists('personalizacion');
    }
};
