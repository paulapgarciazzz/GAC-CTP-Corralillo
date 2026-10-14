<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Ejecuta la migración.
     */
    public function up(): void
    {
        DB::unprepared('
            CREATE TRIGGER trg_auditoria_estado_solicitud
            AFTER UPDATE ON solicitud_agrupacion
            FOR EACH ROW
            BEGIN
                IF OLD.id_estado <> NEW.id_estado THEN
                    INSERT INTO auditoria (
                        id_solicitud,
                        accion,
                        fecha_accion,
                        created_at,
                        updated_at
                    )
                    SELECT
                        NEW.id,
                        e.nom_estado,
                        NOW(),
                        NOW(),
                        NOW()
                    FROM estado e
                    WHERE e.id = NEW.id_estado
                      AND e.nom_estado IN ("aprobada", "rechazada");
                END IF;
            END
        ');
    }

    /**
     * Revierte la migración.
     */
    public function down(): void
    {
        DB::unprepared('DROP TRIGGER IF EXISTS trg_auditoria_estado_solicitud');
    }
};