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
        Schema::table('alimentacion', function (Blueprint $table) {
            $table->unique('tiempo_comida');
        });
    }

    /**
     * Revierte la migración.
     */
    public function down(): void
    {
        Schema::table('alimentacion', function (Blueprint $table) {
            $table->dropUnique(['tiempo_comida']);
        });
    }
};
