<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('mobiliario', function (Blueprint $table) {
            $table->unsignedInteger('cantidad_disponible')->nullable()->after('nombre');
            $table->string('encargado', 150)->nullable()->after('cantidad_disponible');
        });
    }

    public function down(): void
    {
        Schema::table('mobiliario', function (Blueprint $table) {
            $table->dropColumn(['cantidad_disponible', 'encargado']);
        });
    }
};
