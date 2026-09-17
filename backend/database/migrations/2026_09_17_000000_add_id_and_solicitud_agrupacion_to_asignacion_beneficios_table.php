<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('asignacion_beneficios', function (Blueprint $table) {
            $table->unsignedBigInteger('id')->nullable()->after('id_solicitud_beneficios');
            $table->unsignedBigInteger('id_solicitud_agrupacion')->nullable()->after('id');
            $table->text('observaciones')->nullable()->after('id_solicitud_agrupacion');
        });

        DB::table('asignacion_beneficios')->update([
            'id' => DB::raw('id_solicitud_beneficios'),
        ]);

        Schema::table('asignacion_beneficios', function (Blueprint $table) {
            $table->unsignedBigInteger('id')->nullable(false)->change();
            $table->unsignedBigInteger('id_solicitud_agrupacion')->nullable(false)->change();

            $table->unique('id', 'uniq_asignacion_beneficios_id');
            $table->unique('id_solicitud_agrupacion', 'uniq_asignacion_beneficios_solicitud_agrupacion');

            $table->foreign('id_solicitud_agrupacion', 'fk_asignacion_beneficios_solicitud_agrupacion')
                ->references('id')
                ->on('solicitud_agrupacion')
                ->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('asignacion_beneficios', function (Blueprint $table) {
            $table->dropForeign('fk_asignacion_beneficios_solicitud_agrupacion');
            $table->dropUnique('uniq_asignacion_beneficios_id');
            $table->dropUnique('uniq_asignacion_beneficios_solicitud_agrupacion');
            $table->dropColumn(['id_solicitud_agrupacion', 'observaciones', 'id']);
        });
    }
};
