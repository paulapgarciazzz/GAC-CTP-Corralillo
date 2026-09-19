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
        Schema::table('solicitud_mobiliario', function (Blueprint $table) {
            $table->unsignedBigInteger('id_asignacion_beneficios')->after('id_solicitud_mobiliario');

            // Sin cascadeOnDelete(): MySQL no dispara triggers AFTER DELETE sobre filas
            // borradas por una acción de cascada de FK, lo que dejaría sin auditar el
            // borrado de estas líneas de detalle. En su lugar, un trigger BEFORE DELETE en
            // asignacion_beneficios borra explícitamente estas filas (ver migración de
            // triggers), lo cual sí dispara su propio trigger AFTER DELETE.
            $table->foreign('id_asignacion_beneficios')
                ->references('id_solicitud_beneficios')
                ->on('asignacion_beneficios');

            $table->unique(['id_asignacion_beneficios', 'id_sol_mobiliario'], 'uq_solicitud_mobiliario_asignacion_item');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('solicitud_mobiliario', function (Blueprint $table) {
            $table->dropForeign(['id_asignacion_beneficios']);
            $table->dropUnique('uq_solicitud_mobiliario_asignacion_item');
            $table->dropColumn('id_asignacion_beneficios');
        });
    }
};
