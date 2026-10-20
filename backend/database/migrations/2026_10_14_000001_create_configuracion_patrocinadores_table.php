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
        Schema::create('configuracion_patrocinadores', function (Blueprint $table) {
            $table->id();

            $table->string('titulo')->default('Nuestros Patrocinadores');

            $table->text('descripcion')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Revierte la migración.
     */
    public function down(): void
    {
        Schema::dropIfExists('configuracion_patrocinadores');
    }
};
