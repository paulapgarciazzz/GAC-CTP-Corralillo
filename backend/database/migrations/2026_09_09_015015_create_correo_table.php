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
        Schema::create('correo', function (Blueprint $table) {
            $table->id('id_correo');

            $table->string('correo', 150)
                ->unique();

            $table->timestamps();
        });
    }

    /**
     * Revierte la migración.
     */
    public function down(): void
    {
        Schema::dropIfExists('correo');
    }
};
