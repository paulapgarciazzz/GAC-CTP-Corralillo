<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $childTables = [
            'asignacion_mobiliario' => 'fk_asignacion_mobiliario_asignacion_beneficios',
            'asignacion_alimentacion' => 'fk_asignacion_alimentacion_asignacion_beneficios',
            'asignacion_aula' => 'fk_asignacion_aula_asignacion_beneficios',
            'asignacion_tarima' => 'fk_asignacion_tarima_asignacion_beneficios',
            'asignacion_transporte' => 'fk_asignacion_transporte_asignacion_beneficios',
        ];

                $hasLegacyColumn = DB::selectOne(
                        "SELECT 1
                         FROM information_schema.COLUMNS
                         WHERE TABLE_SCHEMA = DATABASE()
                             AND TABLE_NAME = 'asignacion_beneficios'
                             AND COLUMN_NAME = 'id_solicitud_beneficios'"
                );

                $primary = DB::selectOne(
                        "SELECT COLUMN_NAME
                         FROM information_schema.STATISTICS
                         WHERE TABLE_SCHEMA = DATABASE()
                             AND TABLE_NAME = 'asignacion_beneficios'
                             AND INDEX_NAME = 'PRIMARY'
                         ORDER BY SEQ_IN_INDEX
                         LIMIT 1"
                );

                $primaryColumn = $primary?->COLUMN_NAME;

        foreach ($childTables as $table => $constraintName) {
            $foreignKey = DB::selectOne(
                "SELECT CONSTRAINT_NAME
                 FROM information_schema.REFERENTIAL_CONSTRAINTS
                 WHERE CONSTRAINT_SCHEMA = DATABASE()
                   AND TABLE_NAME = ?
                   AND CONSTRAINT_NAME = ?
                   AND REFERENCED_TABLE_NAME = 'asignacion_beneficios'",
                [$table, $constraintName]
            );

            if ($foreignKey) {
                DB::statement(sprintf('ALTER TABLE `%s` DROP FOREIGN KEY `%s`', $table, $constraintName));
            }
        }

        if ($hasLegacyColumn) {
            DB::statement(
                'ALTER TABLE asignacion_beneficios '
                . 'MODIFY COLUMN id_solicitud_beneficios BIGINT UNSIGNED NOT NULL'
            );
        }

        if ($primaryColumn !== null && $primaryColumn !== 'id') {
            DB::statement('ALTER TABLE asignacion_beneficios DROP PRIMARY KEY');
        }

        if ($hasLegacyColumn) {
            DB::statement('ALTER TABLE asignacion_beneficios DROP COLUMN id_solicitud_beneficios');
        }

        $idIsPrimary = $primaryColumn === 'id';
        $alter = 'ALTER TABLE asignacion_beneficios '
            . 'MODIFY COLUMN id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, '
            . 'MODIFY COLUMN id_agrupacion BIGINT UNSIGNED NULL';

        if (! $idIsPrimary) {
            $alter .= ', ADD PRIMARY KEY (id)';
        }

        DB::statement($alter);

        foreach ($childTables as $table => $constraintName) {
            DB::statement(sprintf(
                'ALTER TABLE `%s` ADD CONSTRAINT `%s` FOREIGN KEY (`id_asignacion_beneficios`) REFERENCES `asignacion_beneficios` (`id`) ON DELETE CASCADE',
                $table,
                $constraintName
            ));
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $childTables = [
            'asignacion_mobiliario' => 'fk_asignacion_mobiliario_asignacion_beneficios',
            'asignacion_alimentacion' => 'fk_asignacion_alimentacion_asignacion_beneficios',
            'asignacion_aula' => 'fk_asignacion_aula_asignacion_beneficios',
            'asignacion_tarima' => 'fk_asignacion_tarima_asignacion_beneficios',
            'asignacion_transporte' => 'fk_asignacion_transporte_asignacion_beneficios',
        ];

        foreach ($childTables as $table => $constraintName) {
            DB::statement(sprintf('ALTER TABLE `%s` DROP FOREIGN KEY `%s`', $table, $constraintName));
        }

        DB::statement('ALTER TABLE asignacion_beneficios DROP PRIMARY KEY');
        DB::statement(
            'ALTER TABLE asignacion_beneficios '
            . 'MODIFY COLUMN id BIGINT UNSIGNED NOT NULL, '
            . 'MODIFY COLUMN id_agrupacion BIGINT UNSIGNED NOT NULL'
        );

        foreach ($childTables as $table => $constraintName) {
            DB::statement(sprintf(
                'ALTER TABLE `%s` ADD CONSTRAINT `%s` FOREIGN KEY (`id_asignacion_beneficios`) REFERENCES `asignacion_beneficios` (`id`) ON DELETE CASCADE',
                $table,
                $constraintName
            ));
        }
    }
};