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
        Schema::create('context_rules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('type'); // user, session, business
            $table->json('conditions');
            $table->json('properties');
            $table->integer('priority')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('widget_context_rule', function (Blueprint $table) {
            $table->id();
            $table->foreignId('widget_id')->constrained()->onDelete('cascade');
            $table->foreignId('context_rule_id')->constrained()->onDelete('cascade');
            $table->json('settings')->nullable();
            $table->timestamps();

            $table->unique(['widget_id', 'context_rule_id']);
        });

        Schema::create('context_sessions', function (Blueprint $table) {
            $table->id();
            $table->string('session_id')->unique();
            $table->foreignId('widget_id')->constrained()->onDelete('cascade');
            $table->json('user_data')->nullable();
            $table->json('context_history')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->index('session_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('widget_context_rule');
        Schema::dropIfExists('context_rules');
        Schema::dropIfExists('context_sessions');
    }
};
