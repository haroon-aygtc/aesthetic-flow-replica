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
        Schema::create('provider_models', function (Blueprint $table) {
            $table->id();
            $table->foreignId('provider_id')->constrained('ai_providers')->onDelete('cascade');
            $table->string('model_id'); // API identifier
            $table->string('display_name');
            $table->text('description')->nullable();
            $table->boolean('is_free')->default(false);
            $table->boolean('is_restricted')->default(false);
            $table->boolean('is_featured')->default(false);
            $table->integer('input_token_limit')->nullable();
            $table->integer('output_token_limit')->nullable();
            $table->json('capabilities')->nullable(); // vision, function calling, etc.
            $table->json('pricing')->nullable(); // pricing info
            $table->integer('display_order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('provider_models');
    }
}; 