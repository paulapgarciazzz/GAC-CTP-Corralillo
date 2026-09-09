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
            $table->unsignedBigInteger('id_evento')
                ->nullable()
                ->after('id_agrupacion');

            $table->foreign('id_evento')
                ->references('id_evento')
                ->on('evento');
        });
    }

    /**
     * Revierte la migración.
     */
    public function down(): void
    {
        Schema::table('solicitud_agrupacion', function (Blueprint $table) {
            $table->dropForeign(['id_evento']);
            $table->dropColumn('id_evento');
        });
    }
};