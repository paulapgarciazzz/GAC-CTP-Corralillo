<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Tarima fue reemplazada por Ubicacion (módulo Calendario/Actividades).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('asignacion_tarima');

        if (Schema::hasColumn('asignacion_beneficios', 'id_tarima')) {
            // La FK se creó cuando la tabla aún se llamaba solicitud_beneficios,
            // por eso su nombre se busca en lugar de asumirlo.
            $foreignKey = DB::selectOne(
                "SELECT CONSTRAINT_NAME
                 FROM information_schema.KEY_COLUMN_USAGE
                 WHERE TABLE_SCHEMA = DATABASE()
                   AND TABLE_NAME = 'asignacion_beneficios'
                   AND COLUMN_NAME = 'id_tarima'
                   AND REFERENCED_TABLE_NAME = 'tarima'"
            );

            if ($foreignKey) {
                DB::statement(sprintf(
                    'ALTER TABLE `asignacion_beneficios` DROP FOREIGN KEY `%s`',
                    $foreignKey->CONSTRAINT_NAME
                ));
            }

            Schema::table('asignacion_beneficios', function (Blueprint $table) {
                $table->dropColumn('id_tarima');
            });
        }

        Schema::dropIfExists('tarima');
    }

    public function down(): void
    {
        Schema::create('tarima', function (Blueprint $table) {
            $table->id('id_tarima');
            $table->string('nombre', 100);
            $table->timestamps();
        });

        Schema::table('asignacion_beneficios', function (Blueprint $table) {
            $table->unsignedBigInteger('id_tarima')->nullable();

            $table->foreign('id_tarima', 'solicitud_beneficios_id_tarima_foreign')
                ->references('id_tarima')
                ->on('tarima');
        });

        Schema::create('asignacion_tarima', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_asignacion_beneficios');
            $table->unsignedBigInteger('id_tarima');
            $table->timestamps();

            $table->foreign('id_asignacion_beneficios', 'fk_asignacion_tarima_asignacion_beneficios')
                ->references('id')
                ->on('asignacion_beneficios')
                ->onDelete('cascade');

            $table->foreign('id_tarima', 'fk_asignacion_tarima_tarima')
                ->references('id_tarima')
                ->on('tarima')
                ->onDelete('restrict');

            $table->index('id_asignacion_beneficios', 'idx_asignacion_tarima_asignacion');
        });
    }
};
