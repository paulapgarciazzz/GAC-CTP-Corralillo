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
        Schema::table('asignacion_beneficios', function (Blueprint $table) {
            // Estas FK se crearon cuando la tabla todavía se llamaba `solicitud_beneficios`;
            // el rename a `asignacion_beneficios` no renombra las restricciones existentes.
            $table->dropForeign('solicitud_beneficios_id_solicitud_alimentacion_foreign');
            $table->dropForeign('solicitud_beneficios_id_solicitud_mobiliario_foreign');

            $table->dropColumn(['id_solicitud_alimentacion', 'id_solicitud_mobiliario']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('asignacion_beneficios', function (Blueprint $table) {
            $table->unsignedBigInteger('id_solicitud_alimentacion')->nullable();
            $table->unsignedBigInteger('id_solicitud_mobiliario')->nullable();

            // Nombres explícitos para que un rollback + migrate posterior siga
            // encontrando las mismas restricciones que espera dropear el up() de esta
            // migración (si no, Laravel las nombraría con el prefijo de tabla actual
            // en vez del histórico "solicitud_beneficios_").
            $table->foreign('id_solicitud_alimentacion', 'solicitud_beneficios_id_solicitud_alimentacion_foreign')
                ->references('id_solicitud_alimentacion')
                ->on('solicitud_alimentacion');
            $table->foreign('id_solicitud_mobiliario', 'solicitud_beneficios_id_solicitud_mobiliario_foreign')
                ->references('id_solicitud_mobiliario')
                ->on('solicitud_mobiliario');
        });
    }
};
