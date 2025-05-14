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
        Schema::create('knowledge_insights', function (Blueprint $table) {
            $table->id();
            $table->string('type');
            $table->unsignedBigInteger('source_id');
            $table->string('source_type');
            $table->string('metric');
            $table->float('value');
            $table->timestamp('date');
            $table->json('metadata')->nullable();
            $table->timestamps();
            
            // Add index for polymorphic relationship
            $table->index(['source_id', 'source_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('knowledge_insights');
    }
}; 