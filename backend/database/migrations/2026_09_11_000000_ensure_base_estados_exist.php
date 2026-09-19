<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $ahora = now();

        foreach (['pendiente', 'aprobada', 'rechazada'] as $nombre) {
            DB::table('estado')->updateOrInsert(
                ['nom_estado' => $nombre],
                [
                    'created_at' => $ahora,
                    'updated_at' => $ahora,
                ]
            );
        }
    }

    public function down(): void
    {
        // Los estados base no se eliminan durante un rollback.
    }
};
