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
        Schema::create('agrupacion', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 150);
            $table->string('lugar_procedencia', 150);
            $table->unsignedInteger('cantidad_integrantes');
            $table->date('fecha_asignada')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Revierte la migración.
     */
    public function down(): void
    {
        Schema::dropIfExists('agrupacion');
    }
};