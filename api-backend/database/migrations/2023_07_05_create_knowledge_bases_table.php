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
        Schema::create('knowledge_bases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->json('settings')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('knowledge_base_sources', function (Blueprint $table) {
            $table->id();
            $table->foreignId('knowledge_base_id')->constrained()->onDelete('cascade');
            $table->string('source_type'); // database, file, website, qa_pair
            $table->string('name');
            $table->text('description')->nullable();
            $table->json('settings')->nullable();
            $table->json('metadata')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('priority')->default(0);
            $table->timestamps();
        });

        Schema::create('knowledge_base_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('knowledge_base_source_id')->constrained()->onDelete('cascade');
            $table->text('content');
            $table->text('embedding_vector')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        Schema::create('widget_knowledge_base', function (Blueprint $table) {
            $table->id();
            $table->foreignId('widget_id')->constrained()->onDelete('cascade');
            $table->foreignId('knowledge_base_id')->constrained()->onDelete('cascade');
            $table->json('settings')->nullable();
            $table->timestamps();

            $table->unique(['widget_id', 'knowledge_base_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('widget_knowledge_base');
        Schema::dropIfExists('knowledge_base_entries');
        Schema::dropIfExists('knowledge_base_sources');
        Schema::dropIfExists('knowledge_bases');
    }
};
