<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('mobiliario', function (Blueprint $table): void {
            $table->unsignedInteger('cantidad_total')->default(0)->after('nombre');
        });
    }

    public function down(): void
    {
        Schema::table('mobiliario', function (Blueprint $table): void {
            $table->dropColumn('cantidad_total');
        });
    }
};
