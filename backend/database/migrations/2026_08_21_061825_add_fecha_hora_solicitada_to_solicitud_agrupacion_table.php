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
        Schema::table('solicitud_agrupacion', function (Blueprint $table) {
            $table->date('fecha_solicitada')
                ->nullable()
                ->after('fecha_solicitud');

            $table->time('hora_solicitada')
                ->nullable()
                ->after('fecha_solicitada');
        });
    }

    /**
     * Revierte la migración.
     */
    public function down(): void
    {
        Schema::table('solicitud_agrupacion', function (Blueprint $table) {
            $table->dropColumn([
                'fecha_solicitada',
                'hora_solicitada',
            ]);
        });
    }
};