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
        Schema::table('agrupacion', function (Blueprint $table) {
            $table->string('ced_encargado', 20)
                ->after('id');

            $table->text('resena')
                ->nullable()
                ->after('cantidad_integrantes');

            $table->foreign('ced_encargado')
                ->references('cedula')
                ->on('encargado');

            $table->dropColumn('fecha_asignada');
        });
    }

    /**
     * Revierte la migración.
     */
    public function down(): void
    {
        Schema::table('agrupacion', function (Blueprint $table) {
            $table->date('fecha_asignada')
                ->nullable();

            $table->dropForeign(['ced_encargado']);

            $table->dropColumn('ced_encargado');
            $table->dropColumn('resena');
        });
    }
};