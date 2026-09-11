<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Nombres de todos los triggers creados por esta migración, en el orden en que se crean.
     *
     * @return array<int, string>
     */
    private function triggerNames(): array
    {
        return [
            'trg_asignacion_beneficios_insert',
            'trg_asignacion_beneficios_update',
            'trg_asignacion_beneficios_before_delete',
            'trg_asignacion_beneficios_delete',
            'trg_solicitud_mobiliario_insert',
            'trg_solicitud_mobiliario_update',
            'trg_solicitud_mobiliario_delete',
            'trg_solicitud_alimentacion_insert',
            'trg_solicitud_alimentacion_update',
            'trg_solicitud_alimentacion_delete',
            'trg_solicitud_transporte_update',
            'trg_solicitud_transporte_delete',
            'trg_mobiliario_update',
            'trg_mobiliario_delete',
            'trg_aula_update',
            'trg_aula_delete',
            'trg_alimentacion_update',
            'trg_alimentacion_delete',
            'trg_tarima_update',
            'trg_tarima_delete',
            'trg_ruta_update',
            'trg_ruta_delete',
            'trg_transporte_update',
            'trg_transporte_delete',
        ];
    }

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // asignacion_beneficios: transporte/aula/tarima (columna directa) + auditoría de la fila en sí.
        DB::unprepared('
            CREATE TRIGGER trg_asignacion_beneficios_insert
            AFTER INSERT ON asignacion_beneficios
            FOR EACH ROW
            BEGIN
                IF NEW.id_solicitud_transporte IS NOT NULL THEN
                    INSERT INTO auditoria_beneficios (tabla_afectada, id_registro, accion, tipo_beneficio, id_agrupacion, id_asignacion_beneficios, id_referencia, fecha_solicitud, fecha_accion, created_at, updated_at)
                    VALUES ("asignacion_beneficios", NEW.id_solicitud_beneficios, "creado", "transporte", NEW.id_agrupacion, NEW.id_solicitud_beneficios, NEW.id_solicitud_transporte, NEW.fecha_solicitud, NOW(), NOW(), NOW());
                END IF;
                IF NEW.id_tarima IS NOT NULL THEN
                    INSERT INTO auditoria_beneficios (tabla_afectada, id_registro, accion, tipo_beneficio, id_agrupacion, id_asignacion_beneficios, id_referencia, fecha_solicitud, fecha_accion, created_at, updated_at)
                    VALUES ("asignacion_beneficios", NEW.id_solicitud_beneficios, "creado", "tarima", NEW.id_agrupacion, NEW.id_solicitud_beneficios, NEW.id_tarima, NEW.fecha_solicitud, NOW(), NOW(), NOW());
                END IF;
                IF NEW.id_aula IS NOT NULL THEN
                    INSERT INTO auditoria_beneficios (tabla_afectada, id_registro, accion, tipo_beneficio, id_agrupacion, id_asignacion_beneficios, id_referencia, fecha_solicitud, fecha_accion, created_at, updated_at)
                    VALUES ("asignacion_beneficios", NEW.id_solicitud_beneficios, "creado", "aula", NEW.id_agrupacion, NEW.id_solicitud_beneficios, NEW.id_aula, NEW.fecha_solicitud, NOW(), NOW(), NOW());
                END IF;
            END
        ');

        DB::unprepared('
            CREATE TRIGGER trg_asignacion_beneficios_update
            AFTER UPDATE ON asignacion_beneficios
            FOR EACH ROW
            BEGIN
                IF OLD.id_solicitud_transporte IS NULL AND NEW.id_solicitud_transporte IS NOT NULL THEN
                    INSERT INTO auditoria_beneficios (tabla_afectada, id_registro, accion, tipo_beneficio, id_agrupacion, id_asignacion_beneficios, id_referencia, fecha_solicitud, fecha_accion, created_at, updated_at)
                    VALUES ("asignacion_beneficios", NEW.id_solicitud_beneficios, "creado", "transporte", NEW.id_agrupacion, NEW.id_solicitud_beneficios, NEW.id_solicitud_transporte, NEW.fecha_solicitud, NOW(), NOW(), NOW());
                END IF;
                IF OLD.id_tarima IS NULL AND NEW.id_tarima IS NOT NULL THEN
                    INSERT INTO auditoria_beneficios (tabla_afectada, id_registro, accion, tipo_beneficio, id_agrupacion, id_asignacion_beneficios, id_referencia, fecha_solicitud, fecha_accion, created_at, updated_at)
                    VALUES ("asignacion_beneficios", NEW.id_solicitud_beneficios, "creado", "tarima", NEW.id_agrupacion, NEW.id_solicitud_beneficios, NEW.id_tarima, NEW.fecha_solicitud, NOW(), NOW(), NOW());
                END IF;
                IF OLD.id_aula IS NULL AND NEW.id_aula IS NOT NULL THEN
                    INSERT INTO auditoria_beneficios (tabla_afectada, id_registro, accion, tipo_beneficio, id_agrupacion, id_asignacion_beneficios, id_referencia, fecha_solicitud, fecha_accion, created_at, updated_at)
                    VALUES ("asignacion_beneficios", NEW.id_solicitud_beneficios, "creado", "aula", NEW.id_agrupacion, NEW.id_solicitud_beneficios, NEW.id_aula, NEW.fecha_solicitud, NOW(), NOW(), NOW());
                END IF;

                INSERT INTO auditoria_beneficios (tabla_afectada, id_registro, accion, fecha_accion, created_at, updated_at)
                VALUES ("asignacion_beneficios", NEW.id_solicitud_beneficios, "actualizado", NOW(), NOW(), NOW());
            END
        ');

        // Borra explícitamente el detalle (mobiliario/alimentación) ANTES de que se borre la
        // fila de asignacion_beneficios. MySQL no dispara triggers AFTER DELETE sobre filas
        // eliminadas por una acción de cascada de FK, así que si se dejara esa limpieza a
        // cargo de una FK con cascadeOnDelete(), las bajas de detalle quedarían sin auditar.
        // Al ser un DELETE explícito, sí dispara trg_solicitud_mobiliario_delete /
        // trg_solicitud_alimentacion_delete normalmente, y para cuando la fila padre se borra
        // (después de este trigger) ya no quedan hijos que bloqueen la FK.
        DB::unprepared('
            CREATE TRIGGER trg_asignacion_beneficios_before_delete
            BEFORE DELETE ON asignacion_beneficios
            FOR EACH ROW
            BEGIN
                DELETE FROM solicitud_mobiliario WHERE id_asignacion_beneficios = OLD.id_solicitud_beneficios;
                DELETE FROM solicitud_alimentacion WHERE id_asignacion_beneficios = OLD.id_solicitud_beneficios;
            END
        ');

        DB::unprepared('
            CREATE TRIGGER trg_asignacion_beneficios_delete
            AFTER DELETE ON asignacion_beneficios
            FOR EACH ROW
            BEGIN
                INSERT INTO auditoria_beneficios (tabla_afectada, id_registro, accion, fecha_accion, created_at, updated_at)
                VALUES ("asignacion_beneficios", OLD.id_solicitud_beneficios, "eliminado", NOW(), NOW(), NOW());
            END
        ');

        // solicitud_mobiliario: cada alta es un beneficio otorgado.
        DB::unprepared('
            CREATE TRIGGER trg_solicitud_mobiliario_insert
            AFTER INSERT ON solicitud_mobiliario
            FOR EACH ROW
            BEGIN
                INSERT INTO auditoria_beneficios (tabla_afectada, id_registro, accion, tipo_beneficio, id_agrupacion, id_asignacion_beneficios, id_referencia, fecha_solicitud, fecha_accion, created_at, updated_at)
                SELECT "solicitud_mobiliario", NEW.id_solicitud_mobiliario, "creado", "mobiliario", ab.id_agrupacion, ab.id_solicitud_beneficios, NEW.id_solicitud_mobiliario, ab.fecha_solicitud, NOW(), NOW(), NOW()
                FROM asignacion_beneficios ab
                WHERE ab.id_solicitud_beneficios = NEW.id_asignacion_beneficios;
            END
        ');

        DB::unprepared('
            CREATE TRIGGER trg_solicitud_mobiliario_update
            AFTER UPDATE ON solicitud_mobiliario
            FOR EACH ROW
            BEGIN
                INSERT INTO auditoria_beneficios (tabla_afectada, id_registro, accion, fecha_accion, created_at, updated_at)
                VALUES ("solicitud_mobiliario", NEW.id_solicitud_mobiliario, "actualizado", NOW(), NOW(), NOW());
            END
        ');

        DB::unprepared('
            CREATE TRIGGER trg_solicitud_mobiliario_delete
            AFTER DELETE ON solicitud_mobiliario
            FOR EACH ROW
            BEGIN
                INSERT INTO auditoria_beneficios (tabla_afectada, id_registro, accion, fecha_accion, created_at, updated_at)
                VALUES ("solicitud_mobiliario", OLD.id_solicitud_mobiliario, "eliminado", NOW(), NOW(), NOW());
            END
        ');

        // solicitud_alimentacion: mismo molde que solicitud_mobiliario.
        DB::unprepared('
            CREATE TRIGGER trg_solicitud_alimentacion_insert
            AFTER INSERT ON solicitud_alimentacion
            FOR EACH ROW
            BEGIN
                INSERT INTO auditoria_beneficios (tabla_afectada, id_registro, accion, tipo_beneficio, id_agrupacion, id_asignacion_beneficios, id_referencia, fecha_solicitud, fecha_accion, created_at, updated_at)
                SELECT "solicitud_alimentacion", NEW.id_solicitud_alimentacion, "creado", "alimentacion", ab.id_agrupacion, ab.id_solicitud_beneficios, NEW.id_solicitud_alimentacion, ab.fecha_solicitud, NOW(), NOW(), NOW()
                FROM asignacion_beneficios ab
                WHERE ab.id_solicitud_beneficios = NEW.id_asignacion_beneficios;
            END
        ');

        DB::unprepared('
            CREATE TRIGGER trg_solicitud_alimentacion_update
            AFTER UPDATE ON solicitud_alimentacion
            FOR EACH ROW
            BEGIN
                INSERT INTO auditoria_beneficios (tabla_afectada, id_registro, accion, fecha_accion, created_at, updated_at)
                VALUES ("solicitud_alimentacion", NEW.id_solicitud_alimentacion, "actualizado", NOW(), NOW(), NOW());
            END
        ');

        DB::unprepared('
            CREATE TRIGGER trg_solicitud_alimentacion_delete
            AFTER DELETE ON solicitud_alimentacion
            FOR EACH ROW
            BEGIN
                INSERT INTO auditoria_beneficios (tabla_afectada, id_registro, accion, fecha_accion, created_at, updated_at)
                VALUES ("solicitud_alimentacion", OLD.id_solicitud_alimentacion, "eliminado", NOW(), NOW(), NOW());
            END
        ');

        // solicitud_transporte: solo auditoría técnica (el alta de transporte ya se audita desde asignacion_beneficios).
        DB::unprepared('
            CREATE TRIGGER trg_solicitud_transporte_update
            AFTER UPDATE ON solicitud_transporte
            FOR EACH ROW
            BEGIN
                INSERT INTO auditoria_beneficios (tabla_afectada, id_registro, accion, fecha_accion, created_at, updated_at)
                VALUES ("solicitud_transporte", NEW.id_solicitud_transporte, "actualizado", NOW(), NOW(), NOW());
            END
        ');

        DB::unprepared('
            CREATE TRIGGER trg_solicitud_transporte_delete
            AFTER DELETE ON solicitud_transporte
            FOR EACH ROW
            BEGIN
                INSERT INTO auditoria_beneficios (tabla_afectada, id_registro, accion, fecha_accion, created_at, updated_at)
                VALUES ("solicitud_transporte", OLD.id_solicitud_transporte, "eliminado", NOW(), NOW(), NOW());
            END
        ');

        // Catálogos base: solo auditoría técnica de UPDATE/DELETE.
        DB::unprepared('
            CREATE TRIGGER trg_mobiliario_update
            AFTER UPDATE ON mobiliario
            FOR EACH ROW
            BEGIN
                INSERT INTO auditoria_beneficios (tabla_afectada, id_registro, accion, fecha_accion, created_at, updated_at)
                VALUES ("mobiliario", NEW.id_mobiliario, "actualizado", NOW(), NOW(), NOW());
            END
        ');

        DB::unprepared('
            CREATE TRIGGER trg_mobiliario_delete
            AFTER DELETE ON mobiliario
            FOR EACH ROW
            BEGIN
                INSERT INTO auditoria_beneficios (tabla_afectada, id_registro, accion, fecha_accion, created_at, updated_at)
                VALUES ("mobiliario", OLD.id_mobiliario, "eliminado", NOW(), NOW(), NOW());
            END
        ');

        DB::unprepared('
            CREATE TRIGGER trg_aula_update
            AFTER UPDATE ON aula
            FOR EACH ROW
            BEGIN
                INSERT INTO auditoria_beneficios (tabla_afectada, id_registro, accion, fecha_accion, created_at, updated_at)
                VALUES ("aula", NEW.id_aula, "actualizado", NOW(), NOW(), NOW());
            END
        ');

        DB::unprepared('
            CREATE TRIGGER trg_aula_delete
            AFTER DELETE ON aula
            FOR EACH ROW
            BEGIN
                INSERT INTO auditoria_beneficios (tabla_afectada, id_registro, accion, fecha_accion, created_at, updated_at)
                VALUES ("aula", OLD.id_aula, "eliminado", NOW(), NOW(), NOW());
            END
        ');

        DB::unprepared('
            CREATE TRIGGER trg_alimentacion_update
            AFTER UPDATE ON alimentacion
            FOR EACH ROW
            BEGIN
                INSERT INTO auditoria_beneficios (tabla_afectada, id_registro, accion, fecha_accion, created_at, updated_at)
                VALUES ("alimentacion", NEW.id_alimentacion, "actualizado", NOW(), NOW(), NOW());
            END
        ');

        DB::unprepared('
            CREATE TRIGGER trg_alimentacion_delete
            AFTER DELETE ON alimentacion
            FOR EACH ROW
            BEGIN
                INSERT INTO auditoria_beneficios (tabla_afectada, id_registro, accion, fecha_accion, created_at, updated_at)
                VALUES ("alimentacion", OLD.id_alimentacion, "eliminado", NOW(), NOW(), NOW());
            END
        ');

        DB::unprepared('
            CREATE TRIGGER trg_tarima_update
            AFTER UPDATE ON tarima
            FOR EACH ROW
            BEGIN
                INSERT INTO auditoria_beneficios (tabla_afectada, id_registro, accion, fecha_accion, created_at, updated_at)
                VALUES ("tarima", NEW.id_tarima, "actualizado", NOW(), NOW(), NOW());
            END
        ');

        DB::unprepared('
            CREATE TRIGGER trg_tarima_delete
            AFTER DELETE ON tarima
            FOR EACH ROW
            BEGIN
                INSERT INTO auditoria_beneficios (tabla_afectada, id_registro, accion, fecha_accion, created_at, updated_at)
                VALUES ("tarima", OLD.id_tarima, "eliminado", NOW(), NOW(), NOW());
            END
        ');

        DB::unprepared('
            CREATE TRIGGER trg_ruta_update
            AFTER UPDATE ON ruta
            FOR EACH ROW
            BEGIN
                INSERT INTO auditoria_beneficios (tabla_afectada, id_registro, accion, fecha_accion, created_at, updated_at)
                VALUES ("ruta", NEW.id_ruta, "actualizado", NOW(), NOW(), NOW());
            END
        ');

        DB::unprepared('
            CREATE TRIGGER trg_ruta_delete
            AFTER DELETE ON ruta
            FOR EACH ROW
            BEGIN
                INSERT INTO auditoria_beneficios (tabla_afectada, id_registro, accion, fecha_accion, created_at, updated_at)
                VALUES ("ruta", OLD.id_ruta, "eliminado", NOW(), NOW(), NOW());
            END
        ');

        DB::unprepared('
            CREATE TRIGGER trg_transporte_update
            AFTER UPDATE ON transporte
            FOR EACH ROW
            BEGIN
                INSERT INTO auditoria_beneficios (tabla_afectada, id_registro, accion, fecha_accion, created_at, updated_at)
                VALUES ("transporte", NEW.matricula, "actualizado", NOW(), NOW(), NOW());
            END
        ');

        DB::unprepared('
            CREATE TRIGGER trg_transporte_delete
            AFTER DELETE ON transporte
            FOR EACH ROW
            BEGIN
                INSERT INTO auditoria_beneficios (tabla_afectada, id_registro, accion, fecha_accion, created_at, updated_at)
                VALUES ("transporte", OLD.matricula, "eliminado", NOW(), NOW(), NOW());
            END
        ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        foreach (array_reverse($this->triggerNames()) as $trigger) {
            DB::unprepared("DROP TRIGGER IF EXISTS {$trigger}");
        }
    }
};
