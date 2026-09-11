<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('asignacion_beneficios', function (Blueprint $table): void {
            $table->renameColumn('id_solicitud_beneficios', 'id');
            $table->unsignedBigInteger('id_solicitud')->after('id');
            $table->text('observaciones')->nullable()->after('id_solicitud');
            $table->unique('id_solicitud', 'asignacion_beneficios_id_solicitud_unique');
            $table->foreign('id_solicitud', 'asignacion_beneficios_id_solicitud_foreign')
                ->references('id')
                ->on('solicitud_agrupacion');
        });
    }

    public function down(): void
    {
        Schema::table('asignacion_beneficios', function (Blueprint $table): void {
            $table->dropForeign('asignacion_beneficios_id_solicitud_foreign');
            $table->dropUnique('asignacion_beneficios_id_solicitud_unique');
            $table->dropColumn(['id_solicitud', 'observaciones']);
            $table->renameColumn('id', 'id_solicitud_beneficios');
        });
    }
};
