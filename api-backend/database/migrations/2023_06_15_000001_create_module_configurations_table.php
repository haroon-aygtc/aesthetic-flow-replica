<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('module_configurations', function (Blueprint $table) {
            $table->id();
            $table->string('module_id')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('icon')->default('Settings');
            $table->foreignId('model_id')->nullable()->constrained('ai_models')->nullOnDelete();
            $table->json('settings')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('module_configurations');
    }
};
