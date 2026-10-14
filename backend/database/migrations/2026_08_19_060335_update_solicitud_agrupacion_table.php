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
            // Primero elimina la llave foránea del encargado.
            $table->dropForeign(['ced_encargado']);

            // Elimina la columna porque el encargado ahora se obtiene desde agrupacion.
            $table->dropColumn('ced_encargado');

            // Datos que se asignan al gestionar la solicitud.
            $table->date('fecha_asignada')
                ->nullable()
                ->after('fecha_solicitud');

            $table->time('hora_asignada')
                ->nullable()
                ->after('fecha_asignada');

            $table->text('comentarios')
                ->nullable()
                ->after('id_estado');
        });
    }

    /**
     * Revierte la migración.
     */
    public function down(): void
    {
        Schema::table('solicitud_agrupacion', function (Blueprint $table) {
            // Restaura la columna del encargado.
            $table->string('ced_encargado', 20)
                ->after('id');

            $table->foreign('ced_encargado')
                ->references('cedula')
                ->on('encargado');

            // Elimina los nuevos campos.
            $table->dropColumn([
                'fecha_asignada',
                'hora_asignada',
                'comentarios',
            ]);
        });
    }
};