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
        Schema::table('encargado', function (Blueprint $table) {
            $table->enum('tipo_identificacion', ['cedula', 'dimex', 'pasaporte'])
                ->default('cedula')
                ->after('cedula');
        });
    }

    /**
     * Revierte la migración.
     */
    public function down(): void
    {
        Schema::table('encargado', function (Blueprint $table) {
            $table->dropColumn('tipo_identificacion');
        });
    }
};
