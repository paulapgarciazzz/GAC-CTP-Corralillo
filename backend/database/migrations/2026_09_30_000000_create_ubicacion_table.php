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
        Schema::create('ubicacion', function (Blueprint $table) {
            $table->id('id_ubicacion');

            $table->string('nombre', 100)->unique();

            $table->text('descripcion')->nullable();

            $table->unsignedInteger('capacidad');

            // Data URI en base64, igual que agrupacion.foto_url
            $table->longText('imagen')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Revierte la migración.
     */
    public function down(): void
    {
        Schema::dropIfExists('ubicacion');
    }
};
