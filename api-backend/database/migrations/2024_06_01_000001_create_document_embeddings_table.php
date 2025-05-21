<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_embeddings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained('knowledge_documents')->onDelete('cascade');
            $table->text('content_chunk');
            $table->integer('chunk_index');
            $table->string('embedding_model');
            $table->json('embedding_vector');
            $table->json('metadata')->nullable();
            $table->timestamps();
            
            // Add index for faster lookups
            $table->index(['document_id', 'chunk_index']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_embeddings');
    }
};
