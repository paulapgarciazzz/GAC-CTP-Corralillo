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
        Schema::table('evento', function (Blueprint $table) {
            $table->time('hora_inicio')
                ->nullable()
                ->after('fecha_fin');

            $table->time('hora_fin')
                ->nullable()
                ->after('hora_inicio');

            $table->boolean('todo_el_dia')
                ->default(false)
                ->after('hora_fin');

            $table->string('categoria', 20)
                ->default('info')
                ->after('todo_el_dia');
        });
    }

    /**
     * Revierte la migración.
     */
    public function down(): void
    {
        Schema::table('evento', function (Blueprint $table) {
            $table->dropColumn([
                'hora_inicio',
                'hora_fin',
                'todo_el_dia',
                'categoria',
            ]);
        });
    }
};
