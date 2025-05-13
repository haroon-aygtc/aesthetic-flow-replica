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
        Schema::create('ai_providers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('logo_path')->nullable();
            $table->text('description')->nullable();
            $table->string('api_base_url')->nullable(); // For custom endpoints
            $table->json('capabilities')->nullable(); // chat, embeddings, vision, etc.
            $table->json('auth_config')->nullable(); // auth method, headers, etc.
            $table->boolean('is_active')->default(true);
            $table->boolean('supports_streaming')->default(false);
            $table->boolean('requires_model_selection')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_providers');
    }
}; 