<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KnowledgeDocument extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'type',
        'size',
        'status',
        'category',
        'url',
        'content',
        'metadata',
        'user_id',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'size' => 'integer',
        'metadata' => 'array',
    ];

    /**
     * Get the user that owns the document.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the embeddings for the document.
     */
    public function embeddings()
    {
        return $this->hasMany(DocumentEmbedding::class, 'document_id');
    }

    /**
     * Get the document processing status.
     */
    public function getStatusAttribute($value)
    {
        return $value ?: 'pending';
    }

    /**
     * Check if the document has been processed.
     */
    public function isProcessed()
    {
        return $this->status === 'processed';
    }

    /**
     * Check if the document is being processed.
     */
    public function isProcessing()
    {
        return in_array($this->status, ['processing', 'processing_embeddings']);
    }

    /**
     * Check if the document processing has failed.
     */
    public function hasFailed()
    {
        return $this->status === 'failed';
    }
}