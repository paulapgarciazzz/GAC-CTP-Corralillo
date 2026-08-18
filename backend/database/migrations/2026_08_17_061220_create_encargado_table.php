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
        Schema::create('encargado', function (Blueprint $table) {
            $table->string('cedula', 20)->primary();
            $table->string('primer_nombre', 100);
            $table->string('apellido', 100);
            $table->string('email', 150)->unique();
            $table->string('numero_tel', 20);
            $table->timestamps();
        });
    }

    /**
     * Revierte la migración.
     */
    public function down(): void
    {
        Schema::dropIfExists('encargado');
    }
};