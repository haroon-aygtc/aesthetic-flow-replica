<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DocumentEmbedding extends Model
{
    use HasFactory;

    protected $fillable = [
        'document_id',
        'content_chunk',
        'chunk_index',
        'embedding_model',
        'embedding_vector',
        'metadata',
    ];

    protected $casts = [
        'embedding_vector' => 'array',
        'metadata' => 'array',
    ];

    public function document()
    {
        return $this->belongsTo(KnowledgeDocument::class, 'document_id');
    }
}
