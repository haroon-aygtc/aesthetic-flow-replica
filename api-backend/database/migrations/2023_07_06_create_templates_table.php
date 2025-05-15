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
        Schema::create('templates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('category');
            $table->text('content');
            $table->float('version')->default(1.0);
            $table->boolean('is_default')->default(false);
            $table->json('variables')->nullable();
            $table->json('metadata')->nullable();
            $table->string('status')->default('active'); // active, inactive, draft
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        // Add template_id to ai_models table
        Schema::table('ai_models', function (Blueprint $table) {
            $table->foreignId('template_id')->nullable()->constrained()->nullOnDelete();
        });
        
        Schema::create('template_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('template_id')->constrained()->onDelete('cascade');
            $table->text('content');
            $table->json('placeholders')->nullable();
            $table->json('settings')->nullable();
            $table->string('version_name')->nullable();
            $table->text('change_notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->boolean('is_active')->default(false);
            $table->timestamps();
        });

        Schema::create('widget_template', function (Blueprint $table) {
            $table->id();
            $table->foreignId('widget_id')->constrained()->onDelete('cascade');
            $table->foreignId('template_id')->constrained()->onDelete('cascade');
            $table->json('settings')->nullable();
            $table->timestamps();

            $table->unique(['widget_id', 'template_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('widget_template');
        Schema::dropIfExists('template_versions');
        Schema::dropIfExists('templates');
    }
};
