<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('solicitud_alimentacion', function (Blueprint $table) {
            $table->unsignedBigInteger('id_asignacion_beneficios')->after('id_solicitud_alimentacion');

            // Sin cascadeOnDelete(): ver nota equivalente en la migración de
            // solicitud_mobiliario — el borrado en cascada de FK no dispara triggers
            // AFTER DELETE en MySQL, así que la limpieza se hace desde un trigger
            // BEFORE DELETE en asignacion_beneficios en su lugar.
            $table->foreign('id_asignacion_beneficios')
                ->references('id_solicitud_beneficios')
                ->on('asignacion_beneficios');

            $table->unique(['id_asignacion_beneficios', 'id_alimentacion'], 'uq_solicitud_alimentacion_asignacion_item');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('solicitud_alimentacion', function (Blueprint $table) {
            $table->dropForeign(['id_asignacion_beneficios']);
            $table->dropUnique('uq_solicitud_alimentacion_asignacion_item');
            $table->dropColumn('id_asignacion_beneficios');
        });
    }
};
